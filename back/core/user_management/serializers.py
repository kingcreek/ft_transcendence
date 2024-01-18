from rest_framework import serializers
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth import get_user_model
from pong_auth.models import CustomUser

class UserUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'wins', 'losses', 'status', 'password', 'profile_picture',)
        extra_kwargs = {
            'password': {
                'write_only': True
            },
            'email': {
                'validators': [
                    UniqueValidator(
                        queryset=CustomUser.objects.all()
                    )
                ]
            }
        }

    def update(self, instance, validated_data):
        previous_profile_picture = instance.profile_picture
        if previous_profile_picture:
            previous_profile_picture.delete()
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        instance.username        = validated_data.get('username', instance.username)
        instance.email           = validated_data.get('email', instance.email)
        instance.score           = validated_data.get('wins', instance.wins)
        instance.score           = validated_data.get('losses', instance.losses)
        instance.status          = validated_data.get('status', instance.status)
        instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
        password                 = validated_data.get('password')
        if password:
            instance.set_password(password)
        instance.save()
        return instance