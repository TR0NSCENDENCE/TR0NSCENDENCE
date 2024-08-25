from django.shortcuts import render
from rest_framework import permissions, mixins, viewsets, generics, response, request, views, status, filters
from .serializers import *
from .models import User, UserProfile
from .permissions import IsOwnerOrReadOnly

class UserRegistrationView(views.APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response(serializer.data, status=status.HTTP_201_CREATED)

class UserView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = UserSerializer

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    filter_backends = [filters.SearchFilter]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = UserSerializer
    search_fields = ['username']

class UserProfileUpdateView(generics.UpdateAPIView):
    queryset = UserProfile.objects.all()
    permission_classes = [IsOwnerOrReadOnly]
    serializer_class = UserProfileUpdateSerializer
    lookup_field = 'user__pk'

class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsOwnerOrReadOnly]
    serializer_class = UserSerializer
    lookup_field = 'pk'

class MyUserView(views.APIView):
    def get(self, request, format=None):
        return response.Response(UserSerializer(request.user).data)

class UserActivationView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, activation_uuid, format=None):
        try:
            user = User.objects.get(activation_uuid=activation_uuid)
        except User.DoesNotExist:
            return response.Response(status=404)
        user.is_active = True
        user.save()
        return response.Response(status=200)
