from rest_framework import generics, filters, status
from .models import Stock, Portfolio, Collection, Purchase
from .serializers import StockSerializer, PortfolioSerializer, CollectionSerializer, PurchaseSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
import yfinance as yf

class StockListView(generics.ListAPIView):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['symbol', 'name']

class PortfolioListCreateView(generics.ListCreateAPIView):
    serializer_class = PortfolioSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return Portfolio.objects.filter(user_id=user_id).order_by('-created_at')
        return Portfolio.objects.none()

    def perform_create(self, serializer):
        user_id = self.request.data.get('user_id')
        serializer.save(user_id=user_id)

class PortfolioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Portfolio.objects.all()
    serializer_class = PortfolioSerializer

class CollectionListCreateView(generics.ListCreateAPIView):
    serializer_class = CollectionSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return Collection.objects.filter(user_id=user_id).order_by('-added_at')
        return Collection.objects.none()

    def perform_create(self, serializer):
        user_id = self.request.data.get('user_id')
        serializer.save(user_id=user_id)

class CollectionDeleteView(generics.DestroyAPIView):
    queryset = Collection.objects.all()
    
    def delete(self, request, *args, **kwargs):
        user_id = request.query_params.get('user_id')
        stock_id = request.query_params.get('stock_id')
        if user_id and stock_id:
            Collection.objects.filter(user_id=user_id, stock_id=stock_id).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return super().delete(request, *args, **kwargs)

class PurchaseListCreateView(generics.ListCreateAPIView):
    serializer_class = PurchaseSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return Purchase.objects.filter(user_id=user_id).order_by('-purchased_at')
        return Purchase.objects.none()

    def perform_create(self, serializer):
        user_id = self.request.data.get('user_id')
        serializer.save(user_id=user_id)

class StockHistoryView(APIView):
    def get(self, request, symbol):
        try:
            ticker = yf.Ticker(symbol)
            # Fetch last 60 days to have enough data for 30-day moving average
            history = ticker.history(period="60d")
            
            data = []
            for index, row in history.iterrows():
                data.append({
                    'date': index.strftime('%Y-%m-%d'),
                    'close': row['Close']
                })
            
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
