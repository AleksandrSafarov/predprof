from django.db import models
from django.conf import settings

class Route(models.Model):
    name = models.CharField(max_length=255, default= "")
    userId = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, default=0)

    def __str__(self):
        return self.name

class Place(models.Model):
    point1 = models.CharField(max_length=255, default="")
    point2 = models.CharField(max_length=255, default="")

    def points(self):
        return self.point1 +";" +  self.point2