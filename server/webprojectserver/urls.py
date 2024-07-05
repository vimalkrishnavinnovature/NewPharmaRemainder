from django.contrib import admin
from django.urls import path
from auth_app.views import login_view, signup_view, logout_view, check_login
from healthcare_app.views import  add_guardian, update_guardian, view_guardian,export_guardian
from healthcare_app.views import add_patient,view_patients
from healthcare_app.views import view_prescriptions ,add_prescription
urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', login_view, name='login'),
    path('signup/', signup_view, name='signup'),
    path('logout/', logout_view, name='logout'),
    path('check_login/', check_login, name='check_login'),
    path('guardian/add/', add_guardian, name='add_guardian'),
    path('guardian/update/', update_guardian, name='update_guardian'),
    path('guardian/view/', view_guardian, name='view_guardian'),
    path('guardian/export/', export_guardian, name='export_guardian'),
    path('patient/add/', add_patient, name='add_patient'),
    path('patient/view/', view_patients, name='view_patients'),
    path('prescription/view/<int:patient_id>/', view_prescriptions, name='view_prescriptions'),
    path('prescription/add/<int:patient_id>/', add_prescription, name='add_prescription')

]