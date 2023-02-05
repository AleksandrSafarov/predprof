from django.db import models
from django.conf import settings

class Route(models.Model):
    name = models.CharField(max_length=255),
    userId = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE),

    def __str__(self):
        return self.name

class Place(models.Model):
    name = models.CharField(max_length=255),
    xCoord = models.DecimalField(),
    yCoord = models.DecimalField(),
    routeId = models.ForeignKey('Route', on_delete=models.CASCADE)

    def __str__(self):
        return self.name