import csv, json

def clean(s):
	if s == 'n/a':
		return 0
	num = float(s[1:-1].replace(',', ''))
	#print s, num, s[-1:]
	if s[-1:] == 'B':
		return num * 1000000000.0
	if s[-1:] == 'M':
		return num * 1000000.0
	return num

sector_stocks = dict()
with open ('../data/nasdaq_list.csv', 'rb') as f:
	reader = csv.DictReader(f)
	for row in reader:
		curr = dict()
		curr['symbol'] = row['Symbol']
		curr['company_name'] = row['Name']
		curr['market_cap'] = clean(row['MarketCap'])
		sector = row['Sector']
		if sector == 'n/a':
			sector = 'Miscellaneous'
		curr['sector'] = sector

		if sector not in sector_stocks.keys():
			sector_stocks[sector] = list()
		sector_stocks[sector].append(curr)

portfolio_stocks = dict()
for s in sector_stocks.keys():
	sector_stocks[s] = sorted(sector_stocks[s], key=lambda k: k['market_cap'], reverse=True)
	portfolio_stocks[s] = [c['symbol'] for c in sector_stocks[s][:7]]
	print s
	print portfolio_stocks[s]

with open('../data/sample_portfolios.json', 'w') as f:
	json.dump(portfolio_stocks, f)