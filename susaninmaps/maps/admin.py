from django.contrib import admin

from .models import *

admin.site.register(Route)
admin.site.register(Place)
admin.site.register(HistoryRoute)