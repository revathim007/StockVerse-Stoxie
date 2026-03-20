from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'custom_id', 'username', 'email', 'full_name', 'role', 'mpin', 'phone_number']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'full_name', 'role', 'mpin', 'phone_number']

    def validate_phone_number(self, value):
        if value:
            if not value.isdigit() or len(value) != 10:
                raise serializers.ValidationError("Phone number must be exactly 10 digits and contain only numbers.")
            if User.objects.filter(phone_number=value).exists():
                raise serializers.ValidationError("Phone number already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            full_name=validated_data['full_name'],
            role=validated_data['role'],
            mpin=validated_data.get('mpin', None),
            phone_number=validated_data.get('phone_number', None)
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
