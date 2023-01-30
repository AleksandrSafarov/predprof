from django.urls import path, re_path

from .views import *

urlpatterns = [
    path('', index),
    path('login/', login, name = 'login'),
    path('register/', register, name = 'register'),
    path('logout/', logout_user, name='logout'),
]