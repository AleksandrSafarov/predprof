from django.urls import path

from .views import *

urlpatterns = [
    path('', Index.as_view(), name='index'),
    path('def/', route, name='def'),
    path('save/', save, name='save'),
    path('saveToHistory/', saveToHistory, name='saveToHistory'),
    path('remove/', remove, name='remove'),    
    path('removeFromHistory/', removeFromHistory, name='removeFromHistory')
]