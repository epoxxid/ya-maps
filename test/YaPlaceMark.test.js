const expect = require('chai').expect;
const YaPlaceMark = require('../src/YaPlaceMark.js');
const geo = require('./data/geoData');

function isValidPointObject(point) {
    expect(point.latitude).to.equal(geo.latitude, 'valid latitude');
    expect(point.longitude).to.equal(geo.longitude, 'valid longitude');
}

describe('YaPlaceMark', function () {

    let validPlaceMark = null;

    beforeEach(function() {
        validPlaceMark = new YaPlaceMark(geo.coordArr);
    });

    describe('#constructor()', function () {
        it('creates valid object from coordinates in array format', function () {
            let pm = new YaPlaceMark(geo.coordArr);
            expect(pm).to.be.instanceof(YaPlaceMark);
            isValidPointObject(pm.getPosition());
        });

        it('creates valid object from coordinates in string format', function () {
            let pm = new YaPlaceMark(geo.coordStr);
            expect(pm).to.be.instanceof(YaPlaceMark);
            isValidPointObject(pm.getPosition());
        });

        it('throws exception if coordinates in invalid format', function () {
            geo.invalidCoordinates.forEach(val => {
                expect(function () {
                    new YaPlaceMark(val)
                }, typeof val).to.throw();
            });
        });

        it('does not throw an exception if options is object', function () {
            new YaPlaceMark(geo.coordStr, {});
        });

        it('sets options properly', function () {
            let pm = new YaPlaceMark(geo.coordStr, {
                text: 'Text',
                hint: 'Hint',
                caption: 'Caption',
                balloon: 'Balloon'
            });

            expect(pm.getOptions()).to.be.deep.equal({
                iconContent: 'Text',
                hintContent: 'Hint',
                iconCaption: 'Caption',
                balloonContent: 'Balloon'
            });
        });

        it('sets config properly', function () {
            let pm = new YaPlaceMark(geo.coordStr, {
                color: '#ffffff',
                draggable: true,
                preset: 'hello'
            });

            expect(pm.getConfig()).to.be.deep.equal({
                iconColor: '#ffffff',
                draggable: true,
                preset: 'hello'
            });
        });
    });

    describe('#setGeoObject()', function () {
        it('throws error if passed param is not an object', function() {
            expect(() => {
                validPlaceMark.setGeoObject('');
            }).to.throw('not an object');
        });
        it('throws error if passed param is not valid object', function () {
            expect(() => {
                validPlaceMark.setGeoObject({});
            }).to.throw('is invalid');
        });
        it('sets geoObject properly', function () {
            expect(validPlaceMark.getGeoObject()).to.equal(null);
            validPlaceMark.setGeoObject(geo.yandexGeoObject);
            expect(validPlaceMark.getGeoObject()).to.equal(geo.yandexGeoObject);
        });
    });

    describe('#unsetGeoObject()', function () {
        it('removes geo object from placeMark', function () {
            validPlaceMark.setGeoObject(geo.yandexGeoObject);
            expect(validPlaceMark.getGeoObject()).to.equal(geo.yandexGeoObject);
            validPlaceMark.unsetGeoObject();
            expect(validPlaceMark.getGeoObject()).to.equal(null);
        });
    });

    describe('#startEditing()', function () {
        it('starts editing object successfully', function () {
            expect(validPlaceMark.draggable).to.be.false;
            validPlaceMark.startEditing();
            expect(validPlaceMark.draggable).to.be.true;
        });
    });

    describe('#finishEditing()', function () {
        it('finish editing object successfully', function() {
            validPlaceMark.draggable = true;
            expect(validPlaceMark.draggable).to.be.true;
            validPlaceMark.finishEditing();
            expect(validPlaceMark.draggable).to.be.false;
        });
    });

    describe('#dump()', function () {
        it('created dump properly', function() {
            let pm = new YaPlaceMark(geo.coordArr, {
                text: 'Text',
                hint: 'Hint',
                caption: 'Caption',
                balloon: 'Balloon',
                color: '#ffffff'
            });

            let dump = pm.dump();
            expect(dump).to.be.a('object');
            expect(dump).to.be.deep.equal({
               coordinates: geo.coordArr,
               options: {
                   text: 'Text',
                   hint: 'Hint',
                   caption: 'Caption',
                   balloon: 'Balloon',
                   color: '#ffffff'
               }
            });
        });
    });

    describe('::createFromDump()', function () {
        it('can be recovered from dump', function() {
            let recovered = YaPlaceMark.createFromDump({
                coordinates: geo.coordArr,
                options: {
                    text: 'Text',
                    hint: 'Hint',
                    caption: 'Caption',
                    balloon: 'Balloon',
                    color: '#ffffff'
                }
            });

            isValidPointObject(recovered.getPosition());
            expect(recovered.text).to.be.equal('Text');
            expect(recovered.hint).to.be.equal('Hint');
            expect(recovered.caption).to.be.equal('Caption');
            expect(recovered.balloon).to.be.equal('Balloon');
            expect(recovered.color).to.be.equal('#ffffff');
        });

        it('fails on attempt to create from invalid dump', function() {
            expect(() => {
                YaPlaceMark.createFromDump('');
            }).to.throw('is not an object');
            expect(() => {
                YaPlaceMark.createFromDump({});
            }).to.throw('coordinates value is invalid');
        });
    });

    describe('#asStaticUrlParam()', function() {
        it.skip('converts placeMark into static url param');
    });
});