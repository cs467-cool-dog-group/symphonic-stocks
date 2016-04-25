import csv
import json
import datetime
import os

# start with nasdaq
exchanges = ["nasdaq", "nyse"]
with open("successes.json") as success_file:
    finished_data = json.load(success_file)["successes"]
for exchange in exchanges:
    with open("../data/" + exchange + "_ticker_map.json") as ticker_list_file:
        ticker_list = json.load(ticker_list_file)
    t = 0
    for ticker in ticker_list:
        if ticker in finished_data:
            continue
        t += 1
        print(t, ticker)
        years = {}
        with open("../data/prices/" + exchange + "/" + ticker + ".csv") as csvfile:
            stockreader = csv.reader(csvfile, quotechar='|')
            i = 0
            for row in stockreader:
                i += 1
                if i == 1:
                    continue
                full_date = row[0]
                open_price = float(row[1])
                high = float(row[2])
                low = float(row[3])
                close = float(row[4])
                volume = int(row[5])
                adjclose = float(row[6])
                year = int(full_date.split('-')[0])
                month = int(full_date.split('-')[1])
                day = int(full_date.split('-')[2])
                second_date = datetime.date(year, month, day)
                week = second_date.isocalendar()[1]
                if month == 12 and week == 1:
                    week = 53
                day_of_week = second_date.isoweekday()
                day_of_year = second_date.timetuple().tm_yday
                if year not in years:
                    years[year] = {"days": [], "months": {}, "weeks": {}, "Company": ticker, "open": 0, "high": 0,
                                   "low": float('inf'), "close": 0, "volume": 0, "adj close": 0, "first": float('inf'),
                                   "last": 0, "year": year}
                years[year]["days"].append(
                    {"day": day_of_year, "Company": ticker, "Date": full_date, "Open": open_price, "High": high,
                     "Low": low, "Close": close,
                     "Volume": volume, "Adj Close": adjclose, "year": year})
                years[year]["volume"] += volume
                if high > years[year]["high"]:
                    years[year]["high"] = high
                if low < years[year]["low"]:
                    years[year]["low"] = low
                if day_of_year > years[year]["last"]:
                    years[year]["last"] = day_of_year
                    years[year]["close"] = close
                    years[year]["adj close"] = adjclose
                if day_of_year < years[year]["first"]:
                    years[year]["first"] = day_of_year
                    years[year]["open"] = open_price
                months = years[year]["months"]
                if month not in months:
                    months[month] = {"days": [], "Company": ticker, "open": 0, "high": 0, "low": float('inf'),
                                     "close": 0, "volume": 0, "adj close": 0, "first": float('inf'), "last": 0,
                                     "month": month, "year": year}
                months[month]["days"].append(
                    {"day": day, "Company": ticker, "Date": full_date, "Open": open_price, "High": high, "Low": low,
                     "Close": close,
                     "Volume": volume, "Adj Close": adjclose, "month": month})
                months[month]["volume"] += volume
                if high > months[month]["high"]:
                    months[month]["high"] = high
                if low < months[month]["low"]:
                    months[month]["low"] = low
                if day > months[month]["last"]:
                    months[month]["last"] = day_of_year
                    months[month]["close"] = close
                    months[month]["adj close"] = adjclose
                if day < months[month]["first"]:
                    months[month]["first"] = day_of_year
                    months[month]["open"] = open_price
                years[year]["months"] = months
                weeks = years[year]["weeks"]
                if week not in weeks:
                    weeks[week] = {"days": [], "Company": ticker, "open": 0, "high": 0, "low": float('inf'), "close": 0,
                                   "volume": 0, "adj close": float('inf'), "first": 0, "last": 0, "week": week,
                                   "year": year}
                weeks[week]["days"].append(
                    {"day": day_of_week, "Company": ticker, "Date": full_date, "Open": open_price, "High": high,
                     "Low": low, "Close": close,
                     "Volume": volume, "Adj Close": adjclose, "week": week})
                weeks[week]["volume"] += volume
                if high > weeks[week]["high"]:
                    weeks[week]["high"] = high
                if low < weeks[week]["low"]:
                    weeks[week]["low"] = low
                if day_of_week > weeks[week]["last"]:
                    weeks[week]["last"] = day_of_week
                    weeks[week]["close"] = close
                    weeks[week]["adj close"] = adjclose
                if day < months[month]["first"]:
                    weeks[week]["first"] = day_of_week
                    weeks[week]["open"] = open_price
                years[year]["weeks"] = weeks

        # print(json.dumps(json_v1_out))
        directory = '../data/jsons/' + exchange + '/' + ticker + '/'
        if not os.path.exists(directory):
            os.makedirs(directory)
        for year in years:
            with open(directory + str(year) + '.json', 'w') as year_outfile:
                json.dump({"year": years[year]}, year_outfile, indent=4, sort_keys=True)
            years[year].clear()
        years.clear()
        finished_data.append(ticker)
        with open("successes.json", "w") as success_file:
            json.dump({"successes": finished_data}, success_file)
        break
    break
