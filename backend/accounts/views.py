from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

class UpdateUsernameView(APIView):
    def post(self, request):
        new_username = request.data.get('new_username')
        user_id = request.data.get('user_id')
        
        if not new_username or not user_id:
            return Response({'error': 'Missing data'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(id=user_id)
            if User.objects.filter(username=new_username).exists():
                return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.username = new_username
            user.save()
            return Response({'message': 'Username updated successfully', 'user': UserSerializer(user).data})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if user:
                return Response({
                    'token': 'placeholder-token',
                    'user': UserSerializer(user).data
                })
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
