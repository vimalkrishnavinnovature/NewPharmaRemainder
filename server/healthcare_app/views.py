import json
import xlsxwriter 
import pandas as pd
from io import BytesIO
from django.http import JsonResponse,HttpResponse
from django.shortcuts import render
from healthcare_app.models import Guardian,Patient,Prescription,Medication
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User

#Guardian views
@login_required
@csrf_exempt
def add_guardian(request):
    try:
        user = request.user
        guardian_data = json.loads(request.body)
        
        guardian, created = Guardian.objects.get_or_create(
            UserID=user,
            defaults={
                'FirstName': guardian_data.get('FirstName'),  
                'LastName': guardian_data.get('LastName'),  
                'PhoneNumber': guardian_data.get('PhoneNumber'),  
                'Address': guardian_data.get('Address'), 
                'RelationshipToPatient': guardian_data.get('RelationshipToPatient') 
            }
        )
        
        if created:
            return JsonResponse({'message': 'Guardian added successfully', 'isGuardianCreated': True, 'GuardianID': guardian.GuardianID}, status=200) 
        else:
            return JsonResponse({'message': 'Guardian already exists','isGuardianCreated':False ,'GuardianID': guardian.GuardianID}, status=200)

    except Exception as e:
        return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)

@login_required
@csrf_exempt
def update_guardian(request):
    try:
        user = request.user
        guardian_data = json.loads(request.body)
        guardian = Guardian.objects.get(UserID=user)

        guardian.FirstName = guardian_data.get('FirstName', guardian.FirstName)
        guardian.LastName = guardian_data.get('LastName', guardian.LastName)
        guardian.PhoneNumber = guardian_data.get('PhoneNumber', guardian.PhoneNumber)
        guardian.Address = guardian_data.get('Address', guardian.Address)
        guardian.RelationshipToPatient = guardian_data.get('RelationshipToPatient', guardian.RelationshipToPatient)
        guardian.save()
        
        return JsonResponse({'message': 'Guardian updated successfully'}, status=200)

    except Guardian.DoesNotExist:
        return JsonResponse({'message': 'Guardian not found'}, status=404)
    except Exception as e:
        return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)

@csrf_exempt
@login_required
def view_guardian(request):
    try:
        guardian = request.user.guardian
        if not guardian.FirstName:
            error_message = 'First name is empty'
            return JsonResponse({'profileEmpty': True, 'message': error_message}, status=459)
        return JsonResponse({
            'GuardianID': guardian.GuardianID,
            'FirstName': guardian.FirstName,
            'LastName': guardian.LastName,
            'Email': guardian.UserID.email,
            'PhoneNumber': guardian.PhoneNumber,
            'Address': guardian.Address,
            'RelationshipToPatient': guardian.RelationshipToPatient
        }, status=200)
    except Guardian.DoesNotExist:
        error_message = 'Guardian not found'
        return JsonResponse({'profileEmpty': True, 'message': error_message}, status=460)

#Export the currently logged in guardian details to an excel file along with the patients linked to the guardian and the medications prescribed to the patients
@csrf_exempt
@login_required
def export_guardian(request):
    try:
        guardian = Guardian.objects.get(UserID=request.user)
        patients = Patient.objects.filter(GuardianID=guardian)

        data = []
        for patient in patients:
            patient_data = {
                'PatientID': patient.PatientID,
                'Name': patient.Name,
                'DateOfBirth': patient.DateOfBirth,
                'Gender': patient.Gender,
                'PhoneNumber': patient.PhoneNumber,
                'BloodType': patient.BloodType,
            }
            prescriptions = Prescription.objects.filter(PatientID=patient)
            prescriptions_data = []
            for prescription in prescriptions:
                prescription_data = {
                    'PrescriptionID': prescription.PrescriptionID,
                    'Condition': prescription.Condition,
                    'DoctorName': prescription.DoctorName,
                }
                medications = Medication.objects.filter(PrescriptionID=prescription)
                medications_data = []
                for medication in medications:
                    medication_data = {
                        'MedicationName': medication.MedicationName,
                        'Label': medication.Label,
                        'Dosage': medication.Dosage,
                        'NotificationTime': medication.NotificationTime,
                        'Frequency': medication.Frequency,
                        'StartDate': medication.StartDate,
                        'EndDate': medication.EndDate,
                    }
                    medications_data.append(medication_data)
                prescription_data['Medications'] = medications_data
                prescriptions_data.append(prescription_data)
            patient_data['Prescriptions'] = prescriptions_data
            data.append(patient_data)

        # Convert the data to a pandas DataFrame
        df = pd.DataFrame(data)

        # Save the DataFrame to an Excel file
        excel_file = BytesIO()
        with pd.ExcelWriter(excel_file, engine='xlsxwriter') as writer:
            df.to_excel(writer, sheet_name='Patients')
        excel_file.seek(0)

        # Serve the Excel file as an HTTP response
        response = HttpResponse(excel_file.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="patients_details.xlsx"'
        return response
    except Guardian.DoesNotExist:
        return JsonResponse({'message': 'Guardian not found'}, status=404)
    except Exception as e:
        return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)



#Patient Views
@csrf_exempt
@login_required
def add_patient(request):
    if request.method == 'POST':
        try:
            # Load the patient data from the request
            patient_data = json.loads(request.body)
            # Get the currently logged in user's guardian profile
            guardian = Guardian.objects.get(UserID=request.user)
            
            # Create a new Patient instance and populate it with data from the request
            patient = Patient(
                GuardianID=guardian,
                Name=patient_data.get('name'),
                DateOfBirth=patient_data.get('dateOfBirth'),
                Gender=patient_data.get('gender'),
                PhoneNumber=patient_data.get('phoneNumber'),
                BloodType=patient_data.get('bloodType'),
            )
            # Save the new patient to the database
            patient.save()
            
            # Return a success response
            return JsonResponse({'message': 'Patient added successfully'}, status=200)
        except Guardian.DoesNotExist:
            # Return an error if the guardian is not found
            return JsonResponse({'message': 'Guardian not found'}, status=404)
        except Exception as e:
            # Return a generic error message for any other exceptions
            print(e)
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)
    else:
        # Return an error if the request method is not POST
        return JsonResponse({'message': 'Invalid request method'}, status=405)
    
#view all patients linked to currently logged in guardian  
@csrf_exempt
@login_required
def view_patients(request):
    try:
        # Assuming the request.user is linked to a Guardian instance
        guardian = Guardian.objects.get(UserID=request.user)
        
        # Fetching all patients linked to the guardian
        patients = Patient.objects.filter(GuardianID=guardian).values(
            'PatientID', 'Name', 'DateOfBirth', 'Gender', 'PhoneNumber', 'BloodType'
        )
        
        # Converting the patients query set to a list to make it JSON serializable
        patients_list = list(patients)
        return JsonResponse({'patients': patients_list}, status=200)
    except Guardian.DoesNotExist:
        return JsonResponse({'message': 'Guardian not found'}, status=404)
    except Exception as e:
        return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)
    
#Views For Prescriptions
@csrf_exempt
@login_required
#to view a prescription for a patient
def view_prescriptions(request, patient_id):
    try:
        # Assuming the request.user is linked to a Guardian instance
        guardian = Guardian.objects.get(UserID=request.user)
        
        # Check if the patient belongs to the logged-in guardian
        patient = Patient.objects.filter(GuardianID=guardian, PatientID=patient_id).first()
        if not patient:
            return JsonResponse({'message': 'Patient not found or does not belong to the guardian'}, status=404)
        
        # Fetching all prescriptions linked to the patient
        prescriptions = Prescription.objects.filter(PatientID=patient).values(
            'PrescriptionID', 'Condition', 'DoctorName'
        )
        
        # Fetching medications for each prescription
        prescriptions_list = list(prescriptions)
        for prescription in prescriptions_list:
            medications = Medication.objects.filter(PrescriptionID=prescription['PrescriptionID']).values(
                'MedicationName', 'Label', 'Dosage', 'NotificationTime', 'Frequency', 'StartDate', 'EndDate'
            )
            prescription['Medications'] = list(medications)
        
        return JsonResponse({'prescriptions': prescriptions_list}, status=200)
    except Guardian.DoesNotExist:
        return JsonResponse({'message': 'Guardian not found'}, status=404)
    except Exception as e:
        return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)


#Add Prescription details for a patient
@csrf_exempt
@login_required
def add_prescription(request, patient_id):
    if request.method == 'POST':
        try:
            # Assuming the request.user is linked to a Guardian instance
            guardian = Guardian.objects.get(UserID=request.user)
            
            # Check if the patient belongs to the logged-in guardian
            patient = Patient.objects.filter(GuardianID=guardian, PatientID=patient_id).first()
            if not patient:
                return JsonResponse({'message': 'Patient not found or does not belong to the guardian'}, status=404)
            
            # Parse the JSON body of the request
            data = json.loads(request.body)
            prescriptions = data['prescriptions']
            
            for prescription_data in prescriptions: 
                # Create Prescription instance for each prescription in the request
                prescription_instance = Prescription.objects.create(
                PatientID=patient,
                Condition=prescription_data['Condition'],
                DoctorName=prescription_data['DoctorName']
                )
                
                # Create Medication instances for each medication in the request
                for medication in prescription_data['Medications']:
                    Medication.objects.create(
                    PrescriptionID=prescription_instance,
                    MedicationName=medication['MedicationName'],
                    Label=medication['Label'],
                    Dosage=medication['Dosage'],
                    NotificationTime=medication['NotificationTime'],
                    Frequency=medication['Frequency'],
                    StartDate=medication['StartDate'],
                    EndDate=medication['EndDate']
                    )
            
            return JsonResponse({'message': 'Prescription and medications added successfully'}, status=201)
        except Guardian.DoesNotExist:
            return JsonResponse({'message': 'Guardian not found'}, status=404)
        except Exception as e:
            print(e)
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)
    else:
        return JsonResponse({'message': 'Invalid request method'}, status=405)