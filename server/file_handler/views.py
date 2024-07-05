from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from io import BytesIO
import pandas as pd
from healthcare_app.models import Guardian, Patient, Prescription, Medication

# Create your views here.
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
            #comment it out to get the whole prescription details and medical details also
            '''
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
            '''
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
'''
def import_guardian(request):
    if request.method=='POST':
        try:
            csv_file=request.FILES.get('file')
            if not csv_file:
                return JsonResponse({'message': 'Please upload a file'}, status=400)
            if not csv_file.name.endswith('.csv'):
                return JsonResponse({'message': 'Please upload a CSV file'}, status=400)
            #consider the file is uploaded as chunks
            df = pd.read_csv(csv_file)
'''







'''
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import csv
from io import StringIO
from .models import Guardian, Patient
from django.contrib.auth.models import User
import os

@csrf_exempt
@login_required
def import_patients(request):
    if request.method == 'POST':
        try:
            chunk_number = int(request.POST.get('chunkNumber'))
            total_chunks = int(request.POST.get('totalChunks'))
            csv_file = request.FILES.get('file')
            if not csv_file:
                return JsonResponse({'message': 'No file provided'}, status=400)
            
            # Define a temporary storage path for chunks
            temp_storage_path = 'temp_chunks'
            if not os.path.exists(temp_storage_path):
                os.makedirs(temp_storage_path)
            
            # Save the chunk with a name that includes the chunk number for ordering
            chunk_filename = os.path.join(temp_storage_path, f'chunk_{chunk_number}.csv')
            with open(chunk_filename, 'wb+') as chunk_file:
                for chunk in csv_file.chunks():
                    chunk_file.write(chunk)
            
            # Check if all chunks have been received
            if len(os.listdir(temp_storage_path)) == total_chunks:
                # Combine chunks in the correct order
                combined_csv_string = ''
                for i in range(total_chunks):
                    chunk_path = os.path.join(temp_storage_path, f'chunk_{i}.csv')
                    with open(chunk_path, 'r') as chunk_file:
                        combined_csv_string += chunk_file.read()
                
                # Process the combined CSV
                csv_reader = csv.reader(StringIO(combined_csv_string))
                next(csv_reader)  # Skip header row
                guardian = Guardian.objects.get(UserID=request.user)
                for row in csv_reader:
                    name, date_of_birth, gender, phone_number, blood_type = row
                    Patient.objects.create(
                        GuardianID=guardian,
                        Name=name,
                        DateOfBirth=date_of_birth,
                        Gender=gender,
                        PhoneNumber=phone_number,
                        BloodType=blood_type,
                    )
                
                # Clean up the temporary storage
                for filename in os.listdir(temp_storage_path):
                    os.remove(os.path.join(temp_storage_path, filename))
                os.rmdir(temp_storage_path)
                
                return JsonResponse({'message': 'Patients imported successfully'}, status=200)
            else:
                return JsonResponse({'message': 'Chunk received'}, status=202)
        
        except Guardian.DoesNotExist:
            return JsonResponse({'message': 'Guardian not found'}, status=404)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)
    else:
        return JsonResponse({'message': 'Invalid request method'}, status=405)



'''
