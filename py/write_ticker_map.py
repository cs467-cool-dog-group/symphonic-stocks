import csv
import json
with open('failed_tickers_nasdaq.txt', 'r') as error_file:
    lst = error_file.read().split(',')
    for i in range(len(lst)):
        lst[i] = lst[i].strip()
with open('failed_tickers.txt', 'r') as error_file:
    lst2 = error_file.read().split(',')
    for i in range(len(lst2)):
        lst.append(lst2[i].strip())
nasdaq_tickers = {}
with open('../data/nasdaq_list.csv', newline='') as csvfile:
    stockreader = csv.reader(csvfile, quotechar='|')
    i = 0
    for row in stockreader:
        i+=1
        if i == 1:
            continue
        ticker = row[0]
        name = row[1].strip('"')
        if ticker not in lst:
            nasdaq_tickers[ticker] = name
print(nasdaq_tickers)
with open('../data/nasdaq_ticker_map.json', 'w') as outfile:
    json.dump(nasdaq_tickers,outfile)
nyse_tickers = {}
with open('../data/nyse_list.csv', newline='') as csvfile:
    stockreader = csv.reader(csvfile, quotechar='|')
    i = 0
    for row in stockreader:
        i+=1
        if i == 1:
            continue
        ticker = row[0]
        name = row[1].strip('"')
        if ticker not in lst:
            nyse_tickers[ticker]= name
print(nyse_tickers)
with open('../data/nyse_ticker_map.json', 'w') as outfile:
    json.dump(nyse_tickers,outfile)
with open('../data/sample_portfolios.json', 'r') as sample_json:
    sample_portfolios = json.load(sample_json)
print(sample_portfolios.keys())

sample_tickers = {}
for company_type in sample_portfolios.keys():
    print(sample_portfolios[company_type])
    for ticker in sample_portfolios[company_type]:
        if ticker in nyse_tickers:
            sample_tickers[ticker] = nyse_tickers[ticker]
            print(ticker, "nyse")
        elif ticker in nasdaq_tickers:
            sample_tickers[ticker] = nasdaq_tickers[ticker]
            print(ticker, "nasdaq")
        else:
            print("Not found", ticker)
with open('../data/sample_ticker_map.json', 'w') as outfile:
    json.dump(sample_tickers, outfile)
print(sample_tickers)