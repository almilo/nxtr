describe("filter", function () {
    beforeEach(module("NextTrainApp"));

    describe("minutes", function () {
        var dateFilter;
        var minutesFilter;

        beforeEach(inject(function ($filter) {
            dateFilter = $filter('date');
            minutesFilter = $filter('minutes');
        }));

        it('should exist', function () {
            expect(minutesFilter).not.toBe(null);
        });

        it('should return null for null', function () {
            expect(minutesFilter(null)).toBe(null);
        });

        it('should return 0 mins for same date', function () {
            var date = new Date();
            expect(minutesFilter(dateFilter(date, "medium"), date)).toBe("0 mins");
        });

        it('should return 1 min for 1 min later', function () {
            var date = new Date();
            expect(minutesFilter(dateFilter(date, "medium"), new Date(date - (1000 * 60)))).toBe("1 min");
        });

        it('should return 10 mins for 10 - 1 mins later', function () {
            var date = new Date();
            expect(minutesFilter(dateFilter(date, "medium"), new Date(date - ((10 * 1000 * 60) - 1)))).toBe("10 mins");
        });

        it('should return 10 mins for 10 mins later', function () {
            var date = new Date();
            expect(minutesFilter(dateFilter(date, "medium"), new Date(date - (10 * 1000 * 60)))).toBe("10 mins");
        });
    });

    describe("empty", function () {
        var emptyFilter;

        beforeEach(inject(function ($filter) {
            emptyFilter = $filter('empty');
        }));

        it('should exist', function () {
            expect(emptyFilter).not.toBe(null);
        });

        it('should return given string for null', function () {
            expect(emptyFilter(null, "empty")).toBe("empty");
        });

        it('should return given string for empty string', function () {
            expect(emptyFilter("", "empty")).toBe("empty");
        });

        it('should return same string for non-empty string', function () {
            expect(emptyFilter("value", "empty")).toBe("value");
        });
    });
});