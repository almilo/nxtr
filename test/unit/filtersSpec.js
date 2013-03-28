describe("filter", function () {
    beforeEach(module("NextTrainApp"));

    describe("hour", function () {
        var hourFilter;

        beforeEach(inject(function ($filter) {
            hourFilter = $filter('hour');
        }));

        it('should exist', function () {
            expect(hourFilter).not.toBe(null);
        });

        it('should return null for null', function () {
            expect(hourFilter(null)).toBe(null);
        });

        it('should return empty string for empty string', function () {
            expect(hourFilter("")).toBe("");
        });

        it('should return empty string for non-matching expression', function () {
            expect(hourFilter("01.01.1970-00:00:00")).toBe("");
        });

        it('should return correct time for matching expression', function () {
            expect(hourFilter("01/01/1970T01:02:03+100")).toBe("01:02:03");
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