const expect = require('chai').expect;

const YaPolygon = require('../src/YaPolygon');

describe('YaPolygon', function () {
    describe('#constructor()', function () {
        it.skip('creates valid instance');
        it.skip('throw an error when config is not an object');
        it.skip('sets stroke color properly');
        it.skip('sets stroke width properly');
        it.skip('sets fill color properly');
        it.skip('sets opacity properly');
    });
    describe('#loadVertexes()', function () {
        it.skip('loads vertexes data properly');
        it.skip('throws error when vertexes is not an array');
    });
    describe('#getVertexes()', function() {
        it.skip('returns vertexes list');
    });
    describe('#getOptions()', function() {
        it.skip('returns valid object with polygon options');
    });
    describe('#getConfig()', function() {
        it.skip('returns valid object with polygon config');
    });
    describe('#startEditing()', function() {
        it.skip('does not turn polygon into edit mode if geoObject not loaded');
        it.skip('turns polygon into edit mode');
    });
    describe('#finishEditing()', function() {
        it.skip('turns off polygon edit mode');
    });
    describe('#dump()', function() {
        it.skip('creates valid dump');
    });
    describe('#asStaticUrlParam()', function() {
        it.skip('converts polygon into static url param');
    });
    describe('::createFromDump()', function() {
       it.skip('can be recovered from dump');
       it.skip('fails on invalid dump');
    });

});