from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, ItemViewSet, UserRoleView

router = DefaultRouter()
router.register('items', ItemViewSet, basename='items')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('user-role/', UserRoleView.as_view(), name='user-role'),
    path('', include(router.urls)),
]