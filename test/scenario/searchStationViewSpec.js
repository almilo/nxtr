describe("Search Station view", function() {
    beforeEach(function() {
        browser().navigateTo('/index.html#search');
    });

    it('should have a geolocation message and a default message but not departures not found and fetching', function() {
        expect(browser().location().hash()).toBe("search");
        expect(element('#searchBox').text()).toBe('');
        expect(element('#stationsList').css("display")).not().toBe("none");
        expect(element('#stationsList>li').count()).toBe(0);
    });
});
