from django.urls import path, re_path

from .views import *

urlpatterns = [
    path('logout/', logout_user, name='logout'),
    path('signup/', SignUp.as_view(), name='signup'),
    path('login/', Login.as_view(), name='login')
]