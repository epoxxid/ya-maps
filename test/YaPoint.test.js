const expect = require('chai').expect;
const geo = require('./data/geoData');

const YaPoint = require('../src/domain/YaPoint.js');

function isValidPointObject(point) {
    expect(point).to.be.an.instanceof(YaPoint, 'valid instance');
    expect(point.latitude).to.equal(geo.latitude, 'valid latitude');
    expect(point.longitude).to.equal(geo.longitude, 'valid longitude');
}

describe('YaPoint', function () {

    let validPoint = null;

    beforeEach(function() {
        validPoint = new YaPoint(geo.latitude, geo.longitude);
    });

    describe('#constructor()', function () {
        it('creates valid object', function () {
            isValidPointObject(validPoint);
       });

        it('throws error when invalid latitude passed', function () {
            expect(() => new YaPoint('', geo.longitude)).to.throw('Latitude');
        });

        it('throws error when invalid longitude passed', function () {
            expect(() => new YaPoint(geo.latitude, '')).to.throw('Longitude');
        });
    });
    describe('#fromString()', function () {

        it('creates valid object when valid string passed', function () {
            let point = YaPoint.fromString(geo.coordStr);
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
            let point = YaPoint.fromArray(geo.coordArr);
            isValidPointObject(point);
        });
        it('throws an error, if non-array passed', function () {
            expect(() => {
                YaPoint.fromArray('12.345,54.321');
            }).to.throw('not an array');
        });

        it('requires array with exactly 2 coordinates', function () {
            expect(() => {

                YaPoint.fromArray([12.3]);
            }).to.throw('should have exactly 2');

            expect(() => {
                YaPoint.fromArray([12.3, 12.3, 12,3])
            }).to.throw('should have exactly 2');
        });
    });
    describe('#from()', function () {
        it('create valid object when instance of point passed', function() {
            let point2 = YaPoint.from(validPoint);
            isValidPointObject(point2);
        });
        it('creates valid object when valid array passed', function () {
            let point = YaPoint.from(geo.coordArr);
            isValidPointObject(point);
        });
        it('creates valid object when valid string passed', function () {
            let point = YaPoint.from(geo.coordArr);
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
            expect(coordinates).to.be.deep.equal(geo.coordArr);
        });
        it('converted to valid reversed array of coordinates', function() {
            let coordinates = validPoint.toArray(true);
            expect(coordinates).to.be.instanceof(Array).and.have.lengthOf(2);
            expect(coordinates).to.be.deep.equal(geo.coordArr.reverse());
        });
    });
    describe('#toString()', function() {
        it('converted to valid string of coordinates', function() {
            let str = validPoint.toString();
            expect(str).to.be.a('string');
            expect(str).to.be.equal(geo.coordStr);

            let rev = validPoint.toString(true);
            expect(rev).to.be.a('string');
            expect(rev).to.be.equal(geo.coordStrReversed);
        });
    });
});