from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated, SAFE_METHODS
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, ItemSerializer
from .models import Item

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

from rest_framework.exceptions import PermissionDenied

class IsAdminOrReadOnly(BasePermission):
    message = "Only admin users can perform non-read operations."

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user
        if not (request.user.is_superuser):
            raise PermissionDenied(self.message)
        return True

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

class UserRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        # Determine user's role based on is_superuser and is_staff flags.
        return Response({
            'is_admin': request.user.is_superuser,
            'is_staff': request.user.is_staff
        })