from django import forms
from django.contrib.auth.forms import *
from django.contrib.auth.models import User
from .models import *


class IndexForm(forms.Form):
    name = forms.CharField(
        label="Название", 
        widget=forms.TextInput(attrs={'placeholder': "Введите название маршрута"})
    )

    class Meta:
        model = Route
        fields = ('name')