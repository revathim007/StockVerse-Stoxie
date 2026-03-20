import yfinance as yf
from django.core.management.base import BaseCommand
from stocks.models import Stock
from decimal import Decimal

class Command(BaseCommand):
    help = 'Seeds the database with initial stock data using yfinance'

    def add_arguments(self, parser):
        parser.add_argument('--symbols', nargs='+', type=str, help='Specific symbols to seed')

    def handle(self, *args, **options):
        # Mapping of common names to yfinance symbols
        # NSE stocks usually need .NS suffix
        stock_list = [
            {'name': 'Reliance Industries', 'symbol': 'RELIANCE.NS', 'exchange': 'NSE'},
            {'name': 'HDFC Bank', 'symbol': 'HDFCBANK.NS', 'exchange': 'NSE'},
            {'name': 'ICICI Bank', 'symbol': 'ICICIBANK.NS', 'exchange': 'NSE'},
            {'name': 'State Bank of India', 'symbol': 'SBIN.NS', 'exchange': 'NSE'},
            {'name': 'Infosys', 'symbol': 'INFY.NS', 'exchange': 'NSE'},
            {'name': 'Tata Consultancy Services', 'symbol': 'TCS.NS', 'exchange': 'NSE'},
            {'name': 'Apple Inc.', 'symbol': 'AAPL', 'exchange': 'NASDAQ'},
            {'name': 'Microsoft Corporation', 'symbol': 'MSFT', 'exchange': 'NASDAQ'},
            {'name': 'Amazon.com Inc.', 'symbol': 'AMZN', 'exchange': 'NASDAQ'},
            {'name': 'NVIDIA Corporation', 'symbol': 'NVDA', 'exchange': 'NASDAQ'},
        ]

        # If specific symbols provided, filter the list or add new ones
        if options['symbols']:
            provided_symbols = options['symbols']
            # Simple logic to add new symbols if not in the default list
            existing_symbols = [s['symbol'] for s in stock_list]
            for sym in provided_symbols:
                if sym not in existing_symbols:
                    stock_list.append({'name': sym, 'symbol': sym, 'exchange': 'UNKNOWN'})

        self.stdout.write(self.style.SUCCESS(f'Starting to seed {len(stock_list)} stocks...'))

        for stock_data in stock_list:
            symbol = stock_data['symbol']
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                
                # Extract data from yfinance info
                name = info.get('longName', stock_data['name'])
                sector = info.get('sector', 'N/A')
                price = info.get('currentPrice') or info.get('regularMarketPrice')
                currency = info.get('currency', 'INR')
                pe_ratio = info.get('trailingPE') or info.get('forwardPE')
                
                # Discount calculation: (Target Price - Current Price) / Target Price
                target_price = info.get('targetMeanPrice')
                discount_ratio = None
                if target_price and price:
                    discount_ratio = ((target_price - price) / target_price) * 100

                # Update or create stock in DB
                stock, created = Stock.objects.update_or_create(
                    symbol=symbol,
                    defaults={
                        'name': name,
                        'exchange': stock_data['exchange'],
                        'sector': sector,
                        'current_price': Decimal(str(price)) if price else None,
                        'currency': currency,
                        'pe_ratio': Decimal(str(pe_ratio)) if pe_ratio else None,
                        'discount_ratio': Decimal(str(discount_ratio)) if discount_ratio else None
                    }
                )
                
                status = 'Created' if created else 'Updated'
                self.stdout.write(self.style.SUCCESS(f'Successfully {status} {name} ({symbol}) - Price: {price}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error seeding {symbol}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS('Seeding completed!'))
