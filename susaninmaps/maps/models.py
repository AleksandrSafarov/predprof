from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
import datetime
from django.utils import timezone


class Route(models.Model):
    date = models.DateTimeField(default=datetime.datetime.now(tz=timezone.utc) + datetime.timedelta(hours=3))
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    places = models.CharField(max_length=10000, default="")
    distance = models.CharField(max_length=200, default=0)
    time = models.CharField(max_length=200, default=0)
    countPoints = models.IntegerField(default=0)

    def getdatetime(self):
        return str(self.date.day).zfill(2)+'.'+str(self.date.month).zfill(2)+'.'+str(self.date.year)+', '+ str(self.date.hour).zfill(2)+':'+str(self.date.minute).zfill(2)
    
    def listplaces(self):
        return self.places.split(';')
    

class StaticRoute(models.Model):
    name = models.CharField(max_length=200, default="")
    places = models.CharField(max_length=10000, default="")
    distance = models.CharField(max_length=200, default=0)
    time = models.CharField(max_length=200, default=0)
    countPoints = models.IntegerField(default=0)

    def __str__(self):
        return self.name

    def listplaces(self):
        return self.places.split(';')
    
class HistoryRoute(models.Model):
    date = models.DateTimeField(default=datetime.datetime.now(tz=timezone.utc) + datetime.timedelta(hours=3))# + datetime.timedelta(hours=3) #если время записывается с разницей в 3 часа
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    places = models.CharField(max_length=10000, default="")
    distance = models.CharField(max_length=200, default=0)
    time = models.CharField(max_length=200, default=0)
    countPoints = models.IntegerField(default=0)
    
    def getdatetime(self):
        return str(self.date.day).zfill(2)+'.'+str(self.date.month).zfill(2)+'.'+str(self.date.year)+', '+ str(self.date.hour).zfill(2)+':'+str(self.date.minute).zfill(2)

    def listplaces(self):
        return self.places.split(';')
    
class Place(models.Model):
    point1 = models.CharField(max_length=255, default="")
    point2 = models.CharField(max_length=4095, default="")
