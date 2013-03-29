describe("filter", function () {
    beforeEach(module("NextTrainApp"));

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