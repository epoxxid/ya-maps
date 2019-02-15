const expect = require('chai').expect;

const YaMap = require('../src/YaMap');

describe('YaMap', function () {
    describe('#constructor', function () {
        it.skip('creates valid instances');
    });
    describe('::getAddress()', function () {
        it.skip('returns address by given coordinates');
    });
    describe('::geocode()', function () {
        it.skip('returns valid coordinates by address');
    });
    describe('::buildStaticUrl()', function () {
        it.skip('build valid static URL');
    });
    describe('::createFromDump()', function() {
        it.skip('can be recovered from dump');
    });
    describe('#dump()', function() {
        it.skip('creates valid dump object');
    });
    describe('#setControls()', function () {
        it.skip('sets controls to the map');
    });
    describe('#bindToElement()', function() {
        it.skip('being bounded to DOM element properly');
    });
    describe('#unbindFromElement()', function() {
        it.skip('being unbounded from element properly');
    });
    describe('#getCenter()', function() {
        it.skip('returns valid map center');
    });
    describe('#setCenter()', function() {
        it.skip('sets map center properly');
    });
    describe('#getZeoom()', function() {
        it.skip('returns valid map zoom');
    });
    describe('#setZoom()', function() {
        it.skip('throws error when zoom is out of range');
        it.skip('throws error when zoom has invalid format');
        it.skip('sets map zoom properly');
    });
    describe('#getStaticUrl()', function() {
        it.skip('returns valid static URL');
    });
    describe('#addPlaceMark()', function() {
        it.skip('placeMark can be added');
    });
    describe('#addPolygon()', function() {
        it.skip('polygon can be added');
    });
    describe('#createPolygon()', function() {
        it.skip('new polygon can be created and turned into edit mode');
    });
    describe('#startEditing()', function() {
        it.skip('turn map into edit mode');
    });
    describe('#finishEditing()', function() {
        it.skip('turn off map edit mode');
    });
    describe('#refresh()', function() {
       it.skip('does nothing if map did not bound to DOM yet');
       it.skip('loads map from remote service and updates map objects');
    });
    describe('#startClickAddressMode()', function() {
       it.skip('turns on click address mode');
    });
});