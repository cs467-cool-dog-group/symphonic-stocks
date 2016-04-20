import csv
import urllib.request

url_prefix = 'http://ichart.finance.yahoo.com/table.csv?s='
url_suffix = '&c=1950'
# failed_stocks_nyse = []
# with open('../data/nyse_list.csv', newline='') as csvfile:
#     stockreader = csv.reader(csvfile, quotechar='|')
#     i = 0
#     for row in stockreader:
#         i+=1
#         if i == 1:
#             continue
#         ticker = row[0]
#         print(i, ticker)
#         request = urllib.request.Request(url_prefix+ticker+url_suffix)
#         try:
#             with urllib.request.urlopen(request) as response:
#                 data = response.read()
#                 with open('../data/prices/nyse/'+ticker+'.csv', 'wb') as file:
#                     file.write(data)
#         except:
#             failed_stocks_nyse.append(ticker)
# with open('failed_tickers_nyse.txt', 'w') as error_file:
#     error_file.write(', '.join(failed_stocks_nyse))

failed_stocks_nasdaq = []
with open('../data/nasdaq_list.csv', newline='') as csvfile:
    stockreader = csv.reader(csvfile, quotechar='|')
    i = 0
    for row in stockreader:
        i+=1
        if i == 1:
            continue
        ticker = row[0]
        print(i, ticker)
        request = urllib.request.Request(url_prefix+ticker+url_suffix)
        try:
            with urllib.request.urlopen(request) as response:
                data = response.read()
                with open('../data/prices/nasdaq/'+ticker+'.csv', 'wb') as file:
                    file.write(data)
        except:
            failed_stocks_nasdaq.append(ticker)
with open('failed_tickers_nasdaq.txt', 'w') as error_file:
    error_file.write(', '.join(failed_stocks_nasdaq))