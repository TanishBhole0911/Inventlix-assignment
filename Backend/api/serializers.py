from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Item

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True)  # New required field
    # is_staff and is_superuser are read-only and will be returned in the response
    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'role', 'is_staff','is_superuser']

    def validate_role(self, value):
        if value not in ['admin', 'staff']:
            raise serializers.ValidationError("Role must be either 'admin' or 'staff'.")
        return value

    def create(self, validated_data):
        role = validated_data.pop('role')
        user = User.objects.create_user(**validated_data)
        if role == 'admin':
            user.is_staff = True
            user.is_superuser = True
        elif role == 'staff':
            user.is_staff = True
        user.save()
        return user

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'product_name', 'sku', 'quantity', 'price', 'category']