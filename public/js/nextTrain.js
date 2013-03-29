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

nextTrainApp.filter("empty", function () {
    return function (value, emptyValue) {
        return value == null || value == "" ? emptyValue : value;
    };
});

nextTrainApp.filter("minutes", function ($filter) {
    return function (isoDate, referenceDate) {
        if (isoDate == null) {
            return null;
        }
        if (referenceDate == null) {
            referenceDate = new Date();
        }

        var dateFilter = $filter("date");

        var date = new Date(dateFilter(isoDate, "medium"));

        var dateInMsecs = date.getTime();
        var referenceDateInMsecs = referenceDate.getTime();

        var diffInMsecs = dateInMsecs - referenceDateInMsecs;
        var diffInMins = diffInMsecs == 0 ? 0 : Math.ceil(diffInMsecs / (1000 * 60));

        var units = Math.abs(diffInMins) == 1 ? " min" : " mins";
        return diffInMins + units;
    };
});

nextTrainApp.directive("stationselector", function (EventBus) {
        return {
            restrict: "E",
            scope: {
                label: "@",
                emptylabel: "@"
            },
            replace: true,
            template: "<ul data-role='listview' data-inset='true'>" +
                "<li><a id='stationName' href='#search' data-transition='slide'>{{label | empty:emptylabel}}</a></li>" +
                "</ul>",
            link: function (scope) {
                EventBus.on(nextTrainApp.GEOLOCATION_STARTED_EVENT, function () {
                    scope.label = "Geolocating nearest station...";
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
            replace: true,
            template: "<div>" +
                "<p id='fetchingLabel' ng-show='fetching'>Fetching...</p>" +
                "<div ng-hide='fetching'>" +
                "<p id='hintLabel' ng-show='stationBoard == null'>Please, choose first a departure station above to see the next departures.</p>" +
                "<p id='notFoundLabel' ng-show='stationBoard != null && stationBoard.length == 0'>No departures found.</p>" +
                "<ul id='departuresList' data-role='listview' data-inset='true'>" +
                "<stationboard-entry ng-repeat='departure in stationBoard | limitTo: 10' ng-model='departure'></stationboard-entry>" +
                "</ul>" +
                "</div>" +
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

nextTrainApp.directive("stationboardEntry", function () {
        return {
            restrict: "E",
            replace: true,
            template: "<li>" +
                "<h2>{{departure.name}}</h2>" +
                "<p><strong>to {{departure.to}}</strong></p>" +
                "<p class='ui-li-aside'><strong>{{departure.stop.departure | date:'shortTime'}}</strong> ({{departure.stop.departure | minutes}})</p>" +
                "</li>"
        };
    }
);

nextTrainApp.directive("stationsearch", function (EventBus) {
        return {
            restrict: "E",
            replace: true,
            template: "<div>" +
                "<input id='searchBox' type='search' ng-model='stationName' data-clear-button='true' placeholder='Type to search...'>" +
                "<p id='searchingLabel' ng-show='searching'>Searching...</p>" +
                "<div ng-hide='searching'>" +
                "<p ng-show='locations != null && locations.length == 0'>No stations found.</p>" +
                "<ul id='stationsList' data-role='listview' data-inset='true'>" +
                "<li ng-repeat='location in locations | limitTo: 10'>" +
                "<a href='#main' ng-click='selectStation(&quot;{{location.name}}&quot;)' data-transition='slide' data-direction='reverse'>{{location.name}}</a>" +
                "</li>" +
                "</ul>" +
                "</div>" +
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

    function fetch(stationName) {
        StationBoardSvc.get(
            stationName,
            function (data) {
                $scope.stationBoard = data.stationboard;
            });
    }

    function setStationName(stationName) {
        $scope.stationName = stationName;

        fetch($scope.stationName);
    }

    $scope.update = function () {
        fetch($scope.stationName);
    }

    $scope.findNearestStation = function () {
        if (navigator.geolocation) {
            EventBus.fire(nextTrainApp.GEOLOCATION_STARTED_EVENT);

            navigator.geolocation.getCurrentPosition(
                function (position) {
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
                },
                function (error) {
                    EventBus.fire(nextTrainApp.GEOLOCATION_ENDED_EVENT, null);
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
        $scope.findNearestStation();
    });
});

nextTrainApp.controller("SearchCtrl", function ($scope, EventBus, LocationsSvc) {
    $scope.selectStation = function (stationName) {
        EventBus.fire(nextTrainApp.STATION_CHANGED_EVENT, stationName);
    };

    $scope.$watch("stationName", function (newValue, oldValue) {
        if (newValue != null) {
            LocationsSvc.searchByStationName(
                "*" + newValue + "*",
                function (data) {
                    $scope.locations = data.stations;
                });
        }
    });
});

$(document).bind('pageshow', function () {
    $($('.ui-page.ui-page-active :input:visible')[0]).focus();
});
