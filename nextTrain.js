var nextTrainApp = angular.module("NextTrainApp", []);

nextTrainApp.STATION_CHANGED_EVENT = "stationChanged";
nextTrainApp.GEOLOCATION_STARTED_EVENT = "geolocationStarted";
nextTrainApp.GEOLOCATION_ENDED_EVENT = "geolocationEnded";

nextTrainApp.STATIONBOARD_FETCH_STARTED_EVENT = "stationBoardFetchStarted";
nextTrainApp.STATIONBOARD_FETCH_ENDED_EVENT = "stationBoardFetchEnded";
nextTrainApp.LOCATIONS_SEARCH_BY_NAME_STARTED_EVENT = "locationsSearchByNameStarted";
nextTrainApp.LOCATIONS_SEARCH_BY_NAME_ENDED_EVENT = "locationsSearchByNameEnded";
nextTrainApp.LOCATIONS_SEARCH_BY_POSITION_STARTED_EVENT = "locationsSearchByPositionStarted";
nextTrainApp.LOCATIONS_SEARCH_BY_POSITION_ENDED_EVENT = "locationsSearchByPositionEnded";

nextTrainApp.filter("hour", function () {
    return function (isoTime) {
        return isoTime.match(/.*T(.*)\+.*/)[1];
    };
});

nextTrainApp.filter("empty", function () {
    return function (value, emptyValue) {
        return value == null || value == "" ? emptyValue : value;
    };
});

nextTrainApp.directive("stationselector", function (EventBus) {
        return {
            restrict: "E",
            scope: {
                label: "@",
                emptylabel: "@"
            },
            template: "<ul data-role='listview' data-inset='true'>" +
                "<li><a href='#search' data-transition='slide'>{{label | empty:emptylabel}}</a></li>" +
                "</ul>",
            link: function (scope) {
                EventBus.on(nextTrainApp.GEOLOCATION_STARTED_EVENT, function () {
                    scope.label = "Geolocating closest station...";
                });

                EventBus.on(nextTrainApp.GEOLOCATION_ENDED_EVENT, function (event, stationName) {
                    scope.label = stationName;
                });
            }
        };
    }
);

nextTrainApp.directive("stationboard", function (EventBus) {
        return {
            restrict: "E",
            template: "<p ng-show='fetching'>Fetching departures...</p>" +
                "<div ng-hide='fetching'>" +
                "<p ng-show='stationBoard == null'>Please, choose first a departure station above to see the next departures.</p>" +
                "<p ng-show='stationBoard != null && stationBoard.length == 0'>No departures found</p>" +
                "<ul data-role='listview' data-inset='true'>" +
                "<li ng-repeat='departure in stationBoard | limitTo: 10'>" +
                "{{departure.stop.departure | hour}} - {{departure.name}} to {{departure.to}}" +
                "</li>" +
                "</ul>" +
                "</div>",
            link: function (scope) {
                EventBus.on(nextTrainApp.STATIONBOARD_FETCH_STARTED_EVENT, function () {
                    scope.fetching = true;
                });

                EventBus.on(nextTrainApp.STATIONBOARD_FETCH_ENDED_EVENT, function () {
                    scope.fetching = false;
                });
            }
        };
    }
);

nextTrainApp.directive("stationsearch", function (EventBus) {
        return {
            restrict: "E",
            template: "<input type='search' ng-model='stationName' data-clear-button='true' ng-change='searchStation(&quot;{{stationName}}&quot;)'>" +
                "<p ng-show='searching'>Searching...</p>" +
                "<div ng-hide='searching'>" +
                "<p ng-show='locations != null && locations.length == 0'>No stations found</p>" +
                "<ul data-role='listview' data-inset='true'>" +
                "<li ng-repeat='location in locations | limitTo: 10'>" +
                "<a href='#main' ng-click='selectStation(&quot;{{location.name}}&quot;)' data-transition='slide' data-direction='reverse'>{{location.name}}</a>" +
                "</li>" +
                "</ul>" +
                "</div>",
            link: function (scope) {
                EventBus.on(nextTrainApp.LOCATIONS_SEARCH_BY_NAME_STARTED_EVENT, function () {
                    scope.searching = true;
                });

                EventBus.on(nextTrainApp.LOCATIONS_SEARCH_BY_NAME_ENDED_EVENT, function () {
                    scope.searching = false;
                });
            }
        };
    }
);

nextTrainApp.factory("LocationsSvc", function ($http, EventBus) {
    var LOCATIONS_SERVICE_URL = "http://transport.opendata.ch/v1/locations";

    return {
        searchByPosition: function (lat, lng, success, error) {
            EventBus.fire(nextTrainApp.LOCATIONS_SEARCH_BY_POSITION_STARTED_EVENT);

            $http.get(
                LOCATIONS_SERVICE_URL,
                {params: {x: lat, y: lng}})
                .success(function (data) {
                    EventBus.fire(nextTrainApp.LOCATIONS_SEARCH_BY_POSITION_ENDED_EVENT);

                    success(data);
                })
                .error(function () {
                    EventBus.fire(nextTrainApp.LOCATIONS_SEARCH_BY_NAME_POSITION_ENDED_EVENT);

                    error();
                });
        },

        searchByStationName: function (query, success, error) {
            EventBus.fire(nextTrainApp.LOCATIONS_SEARCH_BY_NAME_STARTED_EVENT);

            $http.get(
                LOCATIONS_SERVICE_URL,
                {params: {query: query}})
                .success(function (data) {
                    EventBus.fire(nextTrainApp.LOCATIONS_SEARCH_BY_NAME_ENDED_EVENT);

                    success(data);
                })
                .error(function () {
                    EventBus.fire(nextTrainApp.LOCATIONS_SEARCH_BY_NAME_ENDED_EVENT);

                    error();
                });
        }
    };
});

nextTrainApp.factory("StationBoardSvc", function ($http, EventBus) {
    var STATIONBOARD_SERVICE_URL = "http://transport.opendata.ch/v1/stationboard";

    return {
        get: function (stationName, success, error) {
            EventBus.fire(nextTrainApp.STATIONBOARD_FETCH_STARTED_EVENT);

            $http.get(
                STATIONBOARD_SERVICE_URL,
                {params: {station: stationName}})
                .success(function (data) {
                    EventBus.fire(nextTrainApp.STATIONBOARD_FETCH_ENDED_EVENT);

                    success(data);
                })
                .error(function () {
                    EventBus.fire(nextTrainApp.STATIONBOARD_FETCH_ENDED_EVENT);

                    error();
                }
            );
        }
    };
});

nextTrainApp.factory("EventBus", function ($rootScope) {
    return {
        fire: function (event, params) {
            $rootScope.$broadcast(event, params);
        },

        on: function (event, listener) {
            $rootScope.$on(event, listener);
        }
    };
});

nextTrainApp.controller("MainCtrl", function ($scope, $timeout, EventBus, LocationsSvc, StationBoardSvc) {
    $scope.clear = function () {
        $scope.stationName = null;
        $scope.stationBoard = null;
    };

    function setStationName(stationName) {
        $scope.stationName = stationName;

        StationBoardSvc.get(
            stationName,
            function (data) {
                $scope.stationBoard = data.stationboard;
            });
    }

    $scope.geolocateClosestStation = function() {
        if (navigator.geolocation) {
            EventBus.fire(nextTrainApp.GEOLOCATION_STARTED_EVENT);

            navigator.geolocation.getCurrentPosition(function (position) {
                LocationsSvc.searchByPosition(
                    position.coords.latitude,
                    position.coords.longitude,
                    function (data) {
                        var stationLocated = data.stations.length > 0 ? data.stations[0].name : null;

                        EventBus.fire(nextTrainApp.GEOLOCATION_ENDED_EVENT, stationLocated);
                    },
                    function (data, status) {
                        EventBus.fire(nextTrainApp.GEOLOCATION_ENDED_EVENT, null);
                    });
            });
        }
    };


    EventBus.on(nextTrainApp.GEOLOCATION_ENDED_EVENT, function (event, stationName) {
        setStationName(stationName);
    });

    EventBus.on(nextTrainApp.STATION_CHANGED_EVENT, function (event, stationName) {
        setStationName(stationName);
    });

    $timeout(function () {
        $scope.geolocateClosestStation();
    });
});

nextTrainApp.controller("SearchCtrl", function ($scope, EventBus, LocationsSvc) {
    $scope.searchStation = function (stationName) {
        LocationsSvc.searchByStationName(
            "*" + stationName + "*",
            function (data) {
                $scope.locations = data.stations;
            });
    };

    $scope.selectStation = function (stationName) {
        EventBus.fire(nextTrainApp.STATION_CHANGED_EVENT, stationName);
    };
});
