from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from pong_auth.models import CustomUser
from .serializers import UserUpdateSerializer

class UserUpdateView(generics.UpdateAPIView):
	serializer_class = UserUpdateSerializer
	queryset = CustomUser.objects.all()
	lookup_field = 'username'