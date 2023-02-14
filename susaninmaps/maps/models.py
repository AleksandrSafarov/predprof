from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class Route(models.Model):
    name = models.CharField(max_length=255, default= "")
    userId = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    places = models.CharField(max_length=255, default="")

    def __str__(self):
        return self.name
    
    def listplaces(self):
        return list(map(int, self.places.split(',')))

class Place(models.Model):
    point1 = models.CharField(max_length=255, default="")
    point2 = models.CharField(max_length=255, default="")

    def points(self):
        return self.point1 + ";" +  self.point2