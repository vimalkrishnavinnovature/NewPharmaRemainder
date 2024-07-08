
# Create your views here.
# #Export the currently logged in guardian details to an excel file along with the patients linked to the guardian and the medications prescribed to the patients
import csv
import os
from django.db import transaction
from django.core.cache import cache
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from io import BytesIO, StringIO
import pandas as pd
from healthcare_app.models import Guardian, Patient, Prescription, Medication
import uuid



# Create your views here.
#Export the currently logged in guardian details to an excel file along with the patients linked to the guardian and the medications prescribed to the patients
@csrf_exempt
@login_required
def download_patient(request):
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
            # Comment it out to get the whole prescription details and medical details also
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



@csrf_exempt
@login_required
def initiate_patient_upload(request):
    if request.method == 'POST':
        try:
            fileName=request.POST.get('fileName')
            fileSize=request.POST.get('fileSize')
            totalChunks=request.POST.get('totalChunks')

            # Generate a unique upload ID
            uploadID = str(uuid.uuid4())
            cacheKey= f'upload_{request.user.id}_{uploadID}'
            cache.set(cacheKey, {
                'fileName': fileName,
                'fileSize': fileSize,
                'totalChunks': totalChunks,
                'ChunksReceived':[],
            }, timeout=3600)    # Set a timeout of 1 hour for the cache entry
            
            return JsonResponse({'uploadID': uploadID}, status=200)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)
    else:
        return JsonResponse({'message': 'Invalid request method'}, status=405)

@csrf_exempt
@login_required
def upload_patient_chunk(request):
    if request.method == 'POST':
        try:
            uploadID = request.POST.get('uploadID')
            chunkNumber = request.POST.get('chunkNumber')
            fileChunk = request.FILES['file']

            cache_key = f'upload_{request.user.id}_{uploadID}'
            uploadSessionData = cache.get(cache_key)
            if not uploadSessionData:
                return JsonResponse({'message': 'Invalid upload session'}, status=400)
            
            # Convert the list of ChunksReceived back to a set to ensure uniqueness
            chunksReceived = set(uploadSessionData.get('ChunksReceived', []))
            chunksReceived.add(chunkNumber)
            
            # Update the cache with the new set of ChunksReceived, converting the set back to a list
            uploadSessionData['ChunksReceived'] = list(chunksReceived)
            cache.set(cache_key, uploadSessionData, timeout=3600)
            
            tempStoragePath = f'tempFiles/{request.user.id}_{uploadID}'
            # Create the temporary storage directory if it doesn't exist and create separate files for each chunk as they may not arrive sequentially
            if not os.path.exists(tempStoragePath):
                os.makedirs(tempStoragePath)
            chunkFilePath = os.path.join(tempStoragePath, f'chunk_{chunkNumber}.part')
            with open(chunkFilePath, 'wb+') as chunkFile:
                chunkFile.write(fileChunk.read())
            return JsonResponse({'message': 'Chunk received'}, status=200)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)
    else:
        return JsonResponse({'message': 'Invalid request method'}, status=405)          



@csrf_exempt
@login_required
def complete_patient_upload(request):
    if request.method == 'POST':
        try:
            upload_id = request.POST.get('uploadID')
            cache_key = f'upload_{request.user.id}_{upload_id}'
            upload_session_data = cache.get(cache_key)
            
            if not upload_session_data:
                print("Invalid upload session")
                return JsonResponse({'message': 'Invalid upload session'}, status=400)
            totalchunks = int(upload_session_data['totalChunks'])
            #check if all chunks have been received
            if (len(upload_session_data['ChunksReceived']) != totalchunks):
                return JsonResponse({'message': 'Incomplete file upload data'}, status=400)
            
            tempStoragePath = f'tempFiles/{request.user.id}_{upload_id}'
            finalFilePath = f'finalFiles/{request.user.id}_{upload_id}.csv'  # Assuming CSV file format
            #create finalFilePath if it does not exist
            if not os.path.exists('finalFiles'):
                os.makedirs('finalFiles')
            
            #combine all the chunks into a single file    
            with open(finalFilePath, 'wb+') as finalFile:
                for chunkNumber in range(totalchunks):
                    chunkFilePath = os.path.join(tempStoragePath, f'chunk_{chunkNumber}.part')
                    with open(chunkFilePath, 'rb') as chunkFile:
                        finalFile.write(chunkFile.read())
                    os.remove(chunkFilePath)
            os.rmdir(tempStoragePath)
            print("File uploaded successfully now processing the file")
            # Process the combined file
            df = pd.read_csv(finalFilePath)
            print("Loaded df")
            # Rename DataFrame columns to match the Patient model fields
            df.rename(columns={
                'Name': 'Name',
                'Date of Birth': 'DateOfBirth',
                'Gender': 'Gender',
                'Phone Number': 'PhoneNumber',
                'Blood Type': 'BloodType'
            }, inplace=True)
            print("finished rename")
            
            guardian = Guardian.objects.get(UserID=request.user)
            batchSize =50000
            for start in range(0, len(df), batchSize):
                end=start+batchSize
                patients_list =[
                    Patient(
                    GuardianID=guardian,
                    Name=row['Name'],
                    DateOfBirth=row['DateOfBirth'],
                    Gender=row['Gender'],
                    PhoneNumber=row['PhoneNumber'],
                    BloodType=row['BloodType']
                    )
                    for index, row in df[start:end].iterrows()
                ]
                with transaction.atomic():
                    Patient.objects.bulk_create(patients_list, batch_size=1000)
                print(f"Inserted {end} records")
                
            # Clean up the final file and delete the cache key
            os.remove(finalFilePath)
            cache.delete(cache_key)
            return JsonResponse({'message': 'File uploaded successfully'}, status=200)
        except Exception as e:
            print(e)
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)
    else:
        return JsonResponse({'message': 'Invalid request method'}, status=405)





















