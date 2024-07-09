# Generated by Django 5.0.6 on 2024-07-09 10:50

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('healthcare_app', '0005_alter_patient_bloodtype'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='patient',
            name='GuardianID',
        ),
        migrations.RemoveField(
            model_name='prescription',
            name='PatientID',
        ),
        migrations.DeleteModel(
            name='Medication',
        ),
        migrations.DeleteModel(
            name='Patient',
        ),
        migrations.DeleteModel(
            name='Prescription',
        ),
    ]