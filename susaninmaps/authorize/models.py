from django.db import models
from django.contrib.auth.models import User
 
 
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    route = models.TextField(default='')
 
    def __str__(self):
        return self.user.username
    
    def listRoutes(self):
        return list(map(int, self.route.split(',')))
 
    class Meta:
        verbose_name_plural = 'UserProfile'