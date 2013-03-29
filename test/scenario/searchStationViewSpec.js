describe("Search Station view", function() {
    beforeEach(function() {
        browser().navigateTo('/index.html#search');
    });

    it('should have empty search box and stations list be visible and empty', function() {
        expect(browser().location().hash()).toBe("search");
        expect(element('#searchBox').text()).toBe('');
        expect(element('#stationsList').css("display")).not().toBe("none");
        expect(element('#stationsList>li').count()).toBe(0);
    });
});
