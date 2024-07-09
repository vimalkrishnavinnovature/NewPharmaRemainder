
import json
from django.db import transaction
from django.http import JsonResponse
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
        page = int(request.GET.get('page', 1))
        patients_per_page = int(request.GET.get('patientsPerPage', 50))

        #offset- it is the number of patients to skip
        offset =(page-1)*patients_per_page
        total_patients = Patient.objects.filter(GuardianID=guardian).count()
        total_pages = total_patients//patients_per_page
    

        # Fetching all patients linked to the guardian
        patients = Patient.objects.filter(GuardianID=guardian).values(
            'PatientID', 'Name', 'DateOfBirth', 'Gender', 'PhoneNumber', 'BloodType'
        )[offset:offset+patients_per_page]
        
        # Converting the patients query set to a list to make it JSON serializable
        patients_list = list(patients)
        return JsonResponse({'patients': patients_list,'totalPages':total_pages}, status=200)
    except Guardian.DoesNotExist:
        return JsonResponse({'message': 'Guardian not found'}, status=404)
    except Exception as e:
        return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)
    
#delete all patient data for the logged in guardian
@csrf_exempt
@login_required
def delete_patients_all(request):
    try:
        guardian = Guardian.objects.get(UserID=request.user)
        patient_ids = Patient.objects.filter(GuardianID=guardian).values_list('PatientID', flat=True)

        if not patient_ids:
            print('No patients found for guardian: %s', request.user.username)  # Consider using logging here
            return JsonResponse({'message': 'No patients found'}, status=404)

        batch_size = 1000
        total_deleted = 0

        for i in range(0, len(patient_ids), batch_size):
            batch_ids = patient_ids[i:i+batch_size]
            with transaction.atomic():
                # Delete the current batch of patients
                deleted_count, _ = Patient.objects.filter(PatientID__in=list(batch_ids)).delete()
                total_deleted += deleted_count

        print(f'{total_deleted} patients deleted for guardian: {request.user.username}')  # Consider using logging here
        return JsonResponse({'message': f'{total_deleted} patients deleted'}, status=200)

    except Guardian.DoesNotExist:
        return JsonResponse({'message': 'Guardian not found'}, status=404)
    except Exception as e:
        print(f'Error: {str(e)}')  # Consider using logging here
        return JsonResponse({'message': 'An error occurred'}, status=500)


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

