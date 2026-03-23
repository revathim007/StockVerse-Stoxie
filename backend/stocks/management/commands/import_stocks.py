
import pandas as pd
from django.core.management.base import BaseCommand
from stocks.models import Stock

class Command(BaseCommand):
    help = 'Import stocks from an Excel file'

    # Nifty indices and their corresponding sectors
    NIFTY_SECTORS = {
        'Nifty Auto': ['ASHOKLEY', 'BAJAJ-AUTO', 'BHARATFORG', 'BOSCHLTD', 'EICHERMOT', 'HEROMOTOCO', 'M&M', 'MARUTI', 'MRF', 'SAMVARDHANA', 'TATAMOTORS', 'TVSMOTOR', 'TIINDIA', 'BALKRISIND', 'EXIDEIND'],
        'Nifty Bank': ['AUBANK', 'AXISBANK', 'BANDHANBNK', 'BANKBARODA', 'FEDERALBNK', 'HDFCBANK', 'ICICIBANK', 'IDFCFIRSTB', 'INDUSINDBK', 'KOTAKBANK', 'PNB', 'SBIN'],
        'Nifty Commodities': ['ADANIENT', 'ADANIPORTS', 'AMBUJACEM', 'ASIANPAINT', 'BAJAJ-AUTO', 'BHARATFORG', 'BPCL', 'COALINDIA', 'EICHERMOT', 'GRASIM', 'HINDALCO', 'HINDUNILVR', 'IOC', 'JSWSTEEL', 'M&M', 'MARUTI', 'NESTLEIND', 'NTPC', 'ONGC', 'POWERGRID', 'RELIANCE', 'SHREECEM', 'SUNPHARMA', 'TATACONSUM', 'TATAMOTORS', 'TATASTEEL', 'TECHM', 'TITAN', 'ULTRACEMCO'],
        'Nifty CPSE': ['BEL', 'BHEL', 'COALINDIA', 'GAIL', 'HAL', 'IOC', 'NMDC', 'NTPC', 'ONGC', 'POWERGRID', 'SAIL', 'RECLTD', 'PFC'],
        'Nifty Energy': ['ADANIENT', 'BPCL', 'COALINDIA', 'GAIL', 'HINDPETRO', 'IOC', 'NTPC', 'ONGC', 'POWERGRID', 'RELIANCE', 'TATAPOWER'],
        'Nifty FMCG': ['BRITANNIA', 'COLPAL', 'DABUR', 'GODREJCP', 'HINDUNILVR', 'ITC', 'MARICO', 'NESTLEIND', 'PGHH', 'TATACONSUM', 'UBL', 'VBL', 'EMAMILTD', 'RADICO', 'JUBLFOOD'],
        'Nifty IT': ['COFORGE', 'HCLTECH', 'INFY', 'LTIM', 'Mphasis', 'PERSISTENT', 'TCS', 'TECHM', 'WIPRO', 'LTI'],
        'Nifty Media': ['DBCORP', 'JAGRAN', 'NDTV', 'SUNTV', 'TV18BRDCST', 'TVTODAY', 'ZEEL', 'PVRINOX', 'SAREGAMA', 'NETWORK18'],
        'Nifty Metal': ['ADANIENT', 'APLAPOLLO', 'HINDALCO', 'HINDZINC', 'JINDALSTEL', 'JSWSTEEL', 'NMDC', 'SAIL', 'TATASTEEL', 'VEDL', 'WELCORP', 'RATNAMANI'],
        'Nifty MNC': ['3MINDIA', 'ABB', 'ACC', 'AMBUJACEM', 'AKZONOBEL', 'BATAINDIA', 'BAYERCROP', 'BOSCHLTD', 'BRITANNIA', 'CASTROLIND', 'COCA-COLA', 'COLPAL', 'CUMMINSIND', 'GILLETTE', 'GLAXO', 'HINDUNILVR', 'HONEYWELL', 'NESTLEIND', 'PFIZER', 'PGHH', 'SANOFI', 'SIEMENS', 'SKFINDIA', 'TIMKEN', 'WHIRLPOOL'],
        'Nifty Pharma': ['ALKEM', 'AUROPHARMA', 'BIOCON', 'CIPLA', 'DIVISLAB', 'DRREDDY', 'GLENMARK', 'GRANULES', 'IPCALAB', 'LAURUSLABS', 'LUPIN', 'SUNPHARMA', 'TORNTPHARM', 'Zyduslife', 'GLAND'],
        'Nifty PSE': ['BEL', 'BHEL', 'COALINDIA', 'GAIL', 'HAL', 'HINDPETRO', 'IOC', 'NMDC', 'NTPC', 'ONGC', 'POWERGRID', 'SAIL', 'RECLTD', 'PFC', 'BANKBARODA', 'CANBK', 'UNIONBANK', 'SBIN'],
        'Nifty PSU Bank': ['BANKBARODA', 'BANKINDIA', 'CANBK', 'CENTRALBK', 'INDIANB', 'IOB', 'MAHABANK', 'PNB', 'PSB', 'SBIN', 'UCOBANK', 'UNIONBANK'],
        'Nifty Realty': ['BRIGADE', 'DLF', 'GODREJPROP', 'IBREALEST', 'LODHA', 'MAHSEAMLES', 'OBEROIRLTY', 'PHOENIXLTD', 'PRESTIGE', 'SOBHA'],
    }

    def handle(self, *args, **options):
        file_path = 'd:\\Revathi\\Biz Metric Internship\\Project 2026\\revathiMaithiliproject\\StockVerse_Stoxie\\USA Top 200 Stocks.xlsx'
        try:
            df = pd.read_excel(file_path)
            for index, row in df.iterrows():
                stock_symbol = row['Symbol']
                stock, created = Stock.objects.get_or_create(symbol=stock_symbol)
                
                stock.name = row['Company']
                stock.exchange = 'NASDAQ'  # Assuming NASDAQ for US stocks

                # Find the sector for the stock
                for sector, symbols in self.NIFTY_SECTORS.items():
                    if stock_symbol in symbols:
                        stock.sector = sector
                        break
                else:
                    stock.sector = row.get('Sector', None)

                stock.current_price = row.get('Price', None)
                stock.currency = 'USD'
                stock.pe_ratio = row.get('PE Ratio', None)
                stock.save()

                if created:
                    self.stdout.write(self.style.SUCCESS(f'Successfully created stock: {stock.name}'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'Successfully updated stock: {stock.name}'))

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR('File not found. Please check the file path.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'An error occurred: {e}'))
