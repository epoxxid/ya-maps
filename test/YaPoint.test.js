const assert = require('assert');
const expect = require('chai').expect;

const YaPoint = require('../src/domain/YaPoint.js').default;

const VALID_LATITUDE = 12.345;
const VALID_LONGITUDE = -54.321;
const VALID_COORDINATES_ARR = [VALID_LATITUDE, VALID_LONGITUDE];
const VALID_COORDINATES_STR = '12.345,-54.321';



describe('YaPoint', function () {

    let validPoint = null;

    function isValidPointObject(point) {
        expect(point).to.be.an.instanceof(YaPoint, 'valid instance');
        expect(point.latitude).to.equal(VALID_LATITUDE, 'valid latitude');
        expect(point.longitude).to.equal(VALID_LONGITUDE, 'valid longitude');
    }

    beforeEach(function() {
        validPoint = new YaPoint(VALID_LATITUDE, VALID_LONGITUDE);
    });

    describe('#constructor()', function () {
        it('creates valid object', function () {
            let point = new YaPoint(VALID_LATITUDE, VALID_LONGITUDE);
            isValidPointObject(point);
       });

        it('throws error when invalid latitude passed', function () {
            expect(() => new YaPoint('', VALID_LONGITUDE)).to.throw('Latitude');
        });

        it('throws error when invalid longitude passed', function () {
            expect(() => new YaPoint(VALID_LATITUDE, '')).to.throw('Longitude');
        });
    });
    describe('#fromString()', function () {

        it('creates valid object when valid string passed', function () {
            let point = YaPoint.fromString(VALID_COORDINATES_STR);
            isValidPointObject(point);
        });

        it('throws an error, if non-string passed', function () {
            expect(function() {
                YaPoint.fromString(123);
            }).to.throw('not a string')
        });

        it('throw an error if invalid string passed', function () {
            expect(function() {
                YaPoint.fromString('123456');
            }).to.throw('string has invalid format');
        });
    });

    describe('#fromArray()', function () {
        it('creates valid object when valid array passed', function () {
            let point = YaPoint.fromArray(VALID_COORDINATES_ARR);
            isValidPointObject(point);
        });
        it('throws an error, if non-array passed', function () {
            expect(() => {
                YaPoint.fromArray('12.345,54.321');
            }).to.throw('not an array');
        });

        it('requires array with exactly 2 coordinates', function () {
            expect(() => {
                YaPoint.fromArray([VALID_LATITUDE]);
            }).to.throw('should have exactly 2');

            expect(() => {
                YaPoint.fromArray([VALID_LATITUDE, VALID_LONGITUDE, VALID_LATITUDE])
            }).to.throw('should have exactly 2');
        });
    });
    describe('#from()', function () {
        it('create valid object when instance of point passed', function() {
            let point2 = YaPoint.from(validPoint);
            isValidPointObject(point2);
        });
        it('creates valid object when valid array passed', function () {
            let point = YaPoint.from(VALID_COORDINATES_ARR);
            isValidPointObject(point);
        });
        it('creates valid object when valid string passed', function () {
            let point = YaPoint.from(VALID_COORDINATES_ARR);
            isValidPointObject(point);
        });
        it('throws an error, if invalid argument passed', function () {
            expect(() => {
                YaPoint.from(123);
            }).to.throw('invalid coordinates format');
        });
    });
    describe('#toArray()', function() {
        it('converted to valid array of coordinates', function() {
            let coordinates = validPoint.toArray();
            expect(coordinates).to.be.instanceof(Array).and.have.lengthOf(2);
            expect(coordinates).to.be.deep.equal(VALID_COORDINATES_ARR);
        });
        it('converted to valid reversed array of coordinates', function() {
            let coordinates = validPoint.toArray(true);
            expect(coordinates).to.be.instanceof(Array).and.have.lengthOf(2);
            expect(coordinates).to.be.deep.equal(VALID_COORDINATES_ARR.reverse());
        });
    });
    describe('#toString()', function() {
        it('converted to valid string of coordinates', function() {
            let str = validPoint.toString();
            expect(str).to.be.a('string');
            expect(str).to.be.equal(VALID_COORDINATES_STR);

            let rev = validPoint.toString(true);
            expect(rev).to.be.a('string');
            expect(rev).to.be.equal(`${VALID_LONGITUDE},${VALID_LATITUDE}`);
        });
    });
});