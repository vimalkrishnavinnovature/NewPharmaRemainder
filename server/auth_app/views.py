import os
import requests
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
import json

UserModal = get_user_model()
#implement login and signup functionality
@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            email = request.POST.get('email')
            password = request.POST.get('password')
            # Captcha verification
            data = {
                'secret': os.getenv('CAPTCHA_SECRET_KEY'),
                'response': request.POST.get('captcha-response')
            }
            r = requests.post('https://www.google.com/recaptcha/api/siteverify', data=data)
            result = r.json()
            if r.status_code != 200:
                return JsonResponse({'message': "Failed to verify captcha"}, status=500)
            if not result.get('success'):
                return JsonResponse({'message': 'Invalid CAPTCHA'}, status=400)
            
            # Check if user exists
            user_exists = User.objects.filter(username=email).exists()
            if not user_exists:
                return JsonResponse({'message': 'User does not exist'}, status=404)
            
            # Authenticate user
            user = authenticate(request, username=email, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({'message': 'Login Successful'})
            else:
                return JsonResponse({'message': 'Invalid email or password'}, status=401)
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)
    return JsonResponse({'message': 'Method not allowed'}, status=405)
@csrf_exempt
def signup_view(request):
    if request.method == 'POST':
        try:
            email = request.POST.get('email')
            password = request.POST.get('password')
            if not email or not password:
                return JsonResponse({'message': 'Email and password are required'}, status=400)
            
            if User.objects.filter(username=email).exists():
                return JsonResponse({'message': 'User already exists'}, status=409)
            
            user = User.objects.create_user(username=email, email=email, password=password)
            user.save()
            
            return JsonResponse({'message': 'Signup Successful'})
        except Exception as e:
            return JsonResponse({'message': f'An error occurred: {str(e)}'}, status=500)
    else:
        return JsonResponse({'message': 'Method not allowed'}, status=405)

from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def check_login(request):
    if request.user.is_authenticated:
        # Assuming you want to return the username as the user information
        return JsonResponse({
            'isAuthenticated': True,
            'user': request.user.email
        })
    else:
        return JsonResponse({'isAuthenticated': False, 'user': None})

@csrf_exempt
@login_required
def logout_view(request):
    if request.method=='POST':
        logout(request)
        return JsonResponse({'message':'Logout Successful'},status=200)
    else:
        return JsonResponse({'message':'Method not allowed'},status=405)
    
