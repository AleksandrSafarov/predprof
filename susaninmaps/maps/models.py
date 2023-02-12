from django.db import models
from django.conf import settings

class Route(models.Model):
    name = models.CharField(max_length=255),
    userId = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE),

    def __str__(self):
        return self.name

class Place(models.Model):
    name = models.CharField(max_length=255),
    point1 = models.CharField(max_length=255),
    point2 = models.CharField(max_length=255)

    def __str__(self):
        return self.name