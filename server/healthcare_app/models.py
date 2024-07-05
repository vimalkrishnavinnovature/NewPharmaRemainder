from django.db import models
from django.contrib.auth.models import User

class Guardian(models.Model):
    GuardianID = models.AutoField(primary_key=True)
    FirstName = models.CharField(max_length=255)
    LastName = models.CharField(max_length=255)
    UserID = models.OneToOneField(User, on_delete=models.CASCADE) 
    PhoneNumber = models.CharField(max_length=20)
    Address = models.TextField()
    RelationshipToPatient = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.FirstName} {self.LastName}"


# Multiple patients for a single guardian
class Patient(models.Model):
    PatientID = models.AutoField(primary_key=True)
    GuardianID = models.ForeignKey(Guardian, on_delete=models.CASCADE)
    Name = models.CharField(max_length=255)
    DateOfBirth = models.DateField()
    Gender = models.CharField(max_length=10)
    PhoneNumber = models.CharField(max_length=20)
    BloodType = models.CharField(max_length=5) 

    def __str__(self):
        return self.Name
    
# Multiple Prescriptions for a patient 
class Prescription(models.Model):
    PrescriptionID = models.AutoField(primary_key=True)
    PatientID = models.ForeignKey(Patient, on_delete=models.CASCADE)
    Condition = models.CharField(max_length=255)
    DoctorName = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.Condition} - {self.DoctorName}"

# Medication model to handle multiple medicine entries for a single prescription
class Medication(models.Model):
    PrescriptionID = models.ForeignKey(Prescription, related_name='medications', on_delete=models.CASCADE)
    MedicationName = models.CharField(max_length=255)
    Label = models.CharField(max_length=255)  # E.g., After breakfast
    Dosage = models.CharField(max_length=255)  # E.g., 500mg
    NotificationTime = models.TimeField()  # Time for notification
    Frequency = models.CharField(max_length=255)  # E.g., twice a day
    StartDate = models.DateField()
    EndDate = models.DateField()

    def __str__(self):
        return self.MedicationName
    
    