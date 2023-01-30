from django.contrib.auth import logout, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from django.core.paginator import Paginator
from django.http import HttpResponse, HttpResponseNotFound, Http404
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView, CreateView
from django.contrib.auth.mixins import LoginRequiredMixin

def index(request):
    return render(request, 'maps/index.html')

def login(request):
    return render(request, 'maps/login.html')

def register(request):
    return render(request, 'maps/register.html')

def logout_user(request):
    logout(request)
    return redirect('login')