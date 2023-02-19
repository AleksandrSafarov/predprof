from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
import datetime


class Route(models.Model):
    name = models.CharField(max_length=255, default= "")
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    places = models.CharField(max_length=4095, default="")
    distanceM = models.IntegerField(default=0)
    timeM = models.IntegerField(default=0)
    isStatic = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
    def listplaces(self):
        return self.places.split(';')
    
    def distance(self):
        if self.distanceM < 1000:
            return str(self.distanceM) + ' м'
        else:
            return str(round(self.distanceM/1000, 1)).replace('.', ',') + ' км'
    
    def time(self):
        if self.timeM <= 60:
            return str(self.timeM) + ' мин'
        elif self.timeM > 60 and self.timeM % 60 == 0:
            return str(self.timeM // 60) + 'ч'
        elif self.timeM > 60 and self.timeM % 60 != 0:
            return str(self.timeM // 60) + ' ч ' + str(self.timeM % 60) + ' мин'

class HistoryRoute(models.Model):
    date = models.DateTimeField(default=datetime.datetime.now())# + datetime.timedelta(hours=3) #если время записывается с разницей в 3 часа
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    places = models.CharField(max_length=4095, default="")
    distanceM = models.IntegerField(default=0)
    timeM = models.IntegerField(default=0)
    
    def getdatetime(self):
        return str(self.date.day).zfill(2)+'.'+str(self.date.month).zfill(2)+'.'+str(self.date.year)+', '+ str(self.date.hour).zfill(2)+':'+str(self.date.minute).zfill(2)

    def listplaces(self):
        return self.places.split(';')
    
    def countplaces(self):
        lst = self.places.split(';')
        return len(lst)
    
    def distance(self):
        if self.distanceM < 1000:
            return str(self.distanceM) + ' м'
        else:
            return str(round(self.distanceM/1000, 1)).replace('.', ',') + ' км'
    
    def time(self):
        if self.timeM <= 60:
            return str(self.timeM) + ' мин'
        elif self.timeM > 60 and self.timeM % 60 == 0:
            return str(self.timeM // 60) + 'ч'
        elif self.timeM > 60 and self.timeM % 60 != 0:
            return str(self.timeM // 60) + ' ч ' + str(self.timeM % 60) + ' мин'

class Place(models.Model):
    point1 = models.CharField(max_length=255, default="")
    point2 = models.CharField(max_length=4095, default="")

    def points(self):
        return self.point1 + ";" +  self.point2
