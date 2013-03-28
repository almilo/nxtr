describe("Main view", function() {
    beforeEach(function() {
        browser().navigateTo('public/index.html');
    });

    it('should have a geolocation message and a default message but not departures not found and fetching', function() {
        expect(browser().location().path()).toBe("/index.html");
        expect(element('#stationName').html()).toContain('Geolocating');
        expect(element('#stationBoardResults').html()).toContain("Please, choose");
        expect(element('#stationBoardResults').html()).not.toContain("No departures found");
        expect(element('#stationBoardResults').html()).not.toContain("Fetching departures");
    });
});
