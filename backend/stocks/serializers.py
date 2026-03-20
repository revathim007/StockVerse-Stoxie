from rest_framework import serializers
from .models import Stock, Portfolio, Collection, Purchase, PortfolioItem

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = ['id', 'symbol', 'name', 'exchange', 'sector', 'current_price', 'currency', 'pe_ratio', 'discount_ratio', 'last_updated']

class PortfolioItemSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    stock_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = PortfolioItem
        fields = ['stock', 'stock_id', 'quantity']

class PortfolioSerializer(serializers.ModelSerializer):
    items = PortfolioItemSerializer(many=True, read_only=True)
    # stocks_data will handle the input list of {stock_id, quantity}
    stocks_data = serializers.ListField(
        child=serializers.DictField(), write_only=True
    )

    class Meta:
        model = Portfolio
        fields = ['id', 'portfolio_id', 'name', 'items', 'stocks_data', 'created_at']
        read_only_fields = ['portfolio_id', 'created_at']

    def create(self, validated_data):
        stocks_data = validated_data.pop('stocks_data')
        portfolio = Portfolio.objects.create(**validated_data)
        for item in stocks_data:
            stock = Stock.objects.get(id=item['stock_id'])
            PortfolioItem.objects.create(
                portfolio=portfolio,
                stock=stock,
                quantity=item.get('quantity', 1)
            )
        return portfolio

    def update(self, instance, validated_data):
        stocks_data = validated_data.pop('stocks_data', None)
        instance.name = validated_data.get('name', instance.name)
        instance.save()
        
        if stocks_data is not None:
            # For simplicity, we'll just add/update items
            for item in stocks_data:
                stock = Stock.objects.get(id=item['stock_id'])
                PortfolioItem.objects.update_or_create(
                    portfolio=instance,
                    stock=stock,
                    defaults={'quantity': item.get('quantity', 1)}
                )
        return instance

class CollectionSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    stock_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Collection
        fields = ['id', 'stock', 'stock_id', 'added_at']

    def create(self, validated_data):
        stock_id = validated_data.pop('stock_id')
        stock = Stock.objects.get(id=stock_id)
        collection, created = Collection.objects.get_or_create(
            user=validated_data['user'],
            stock=stock
        )
        return collection

class PurchaseSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    stock_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Purchase
        fields = ['id', 'stock', 'stock_id', 'quantity', 'purchase_price', 'total_amount', 'purchased_at']
        read_only_fields = ['purchase_price', 'total_amount', 'purchased_at']

    def create(self, validated_data):
        stock_id = validated_data.pop('stock_id')
        stock = Stock.objects.get(id=stock_id)
        quantity = validated_data['quantity']
        purchase_price = stock.current_price
        total_amount = purchase_price * quantity
        
        purchase = Purchase.objects.create(
            stock=stock,
            purchase_price=purchase_price,
            total_amount=total_amount,
            **validated_data
        )
        return purchase
