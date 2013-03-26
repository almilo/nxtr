angular.module("Transport", []);

function TransportCtrl($scope, $http) {
    var LOCATIONS_SERVICE = "http://transport.opendata.ch/v1/locations";

    $scope.doSearch = function (stationName) {
        if (stationName === undefined) {
            stationName = $scope.stationName;
        } else {
            $scope.stationName = stationName;
        }

        var query = "*" + stationName + "*";
        $http.get(
            LOCATIONS_SERVICE,
            {params: {query: query}}
        ).success(function (data) {
                $scope.locationsResult = data;
            });
    };

    function geoLocate() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var x = position.coords.latitude;
                var y = position.coords.longitude;

                $http.get(
                    LOCATIONS_SERVICE,
                    {params: {x: x, y: y}}
                ).success(function (data) {
                        var stationName = data.stations.length > 0 ? data.stations[0].name : "";
                        $scope.doSearch(stationName);
                    }).error(function (data, status) {
                        $scope.locationsResult = {stations: [
                            {name: "Error code: '" + status + "' retrieving locations."}
                        ]};
                    });
            });
        }
    }

    geoLocate();
    //$scope.doSearch("Basel");
}