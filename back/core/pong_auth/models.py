from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class CustomUser(AbstractUser):
	class Status(models.TextChoices):
		OFFLINE = "offline"
		ONLINE = "online"
		INGAME = "ingame"
		INQUEU = "inqueu"

	wins 			= models.IntegerField(default=0)
	losses 			= models.IntegerField(default=0)
	status 			= models.CharField(choices=Status, default=Status.OFFLINE)
	#TODO add default profile picture
	profile_picture = models.ImageField(upload_to='media/', null=True, blank=True)
	friends 		= models.ManyToManyField('self', blank=True)
	#TODO Historial should be a table of tournaments
	#history