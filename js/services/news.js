var newsServices = angular.module('news.services', []);

newsServices.factory('News', function($http) {
    return {
        getIndexData: function(index) {
            return $http.get('./data/' + index + '_ticker_map.json')
        },
        getCompany: function(company_ticker, nyse_data, nasdaq_data) {
            for (var j in nyse_data) {
                if (j == company_ticker) {
                    return nyse_data[j];
                }
            }
            for (var k in nasdaq_data) {
                if (k == company_ticker) {
                    return nasdaq_data[k];
                }
            }
            return "INVALID";

        },
        getDate: function(date) {
            var date = date.split("-");
            var date =  ''+date[2]+date[0]+date[1] +''
            return date;
        },
        getNews: function(company, date) {
            return $http.get('https://www.googleapis.com/customsearch/v1?key=AIzaSyBZ4XDn56vWqsePz6GCKvgNCB6HgTpfcMc&cx=000865311947915661536:bb8ld1ef4ko&sort=date:r:' + date + ':' + date + '&q=' + company + '');
        },
        parseNewsData: function(news_data) {
            var newsData = [];
            for(i = 0; i < news_data.items.length; i++){
                var currentObject = {};
                currentObject["title"] = news_data.items[i].title;
                currentObject["link"] = news_data.items[i].link;
                newsData.push(currentObject);
            }
            return newsData;
        }
    };
});