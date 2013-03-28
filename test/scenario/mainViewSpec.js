describe("Main view", function() {
    beforeEach(function() {
        browser().navigateTo('/index.html');
    });

    it('should have a geolocation message and a default message but not departures not found and fetching', function() {
        expect(browser().location().path()).toBe("/index.html");
        expect(element('#stationName').text()).toContain('Geolocating');
        expect(element('#fetchingLabel').css("display")).toBe("none");
        expect(element('#notFoundLabel').css("display")).toBe("none");
        expect(element('#hintLabel').css("display")).not().toBe("none");
        expect(element('#departuresList').css("display")).not().toBe("none");
        expect(element('#departuresList>li').count()).toBe(0);
    });
});
