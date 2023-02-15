from django.conf import settings
from django.contrib.auth.models import User
from django.db import models


class Route(models.Model):
    name = models.CharField(max_length=255, default= "")
    userId = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    places = models.CharField(max_length=1023, default="")
    distanceM = models.IntegerField(default=0)
    timeM = models.IntegerField(default=0)
    isStatic = models.BooleanField(default=False)

    def __str__(self):
        return self.name
    
    def listplaces(self):
        return list(map(int, self.places.split(',')))
    
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
    point2 = models.CharField(max_length=255, default="")

    def points(self):
        return self.point1 + ";" +  self.point2
