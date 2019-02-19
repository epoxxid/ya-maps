(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const loader = require('./loader');

const YaPoint = require('./YaPoint');

const YaPlaceMark = require('./YaPlaceMark');

const YaPolygon = require('./YaPolygon');

const DEFAULT_CENTER = [44.99, 41.12];
const DEFAULT_ZOOM = 10;
const MAX_ALLOWED_ZOOM = 20;
const MAPS_SRC = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&mode=debug';
/**
 *
 */

class YaMap {
  constructor(config = {}) {
    if (typeof config !== 'object') {
      throw new Error('YaMap config should be an array');
    }

    if (config.center) {
      this.setCenter(config.center);
    } else {
      this.setCenter(DEFAULT_CENTER);
    }

    if (config.zoom) {
      this.setZoom(config.zoom);
    } else {
      this.setZoom(DEFAULT_ZOOM);
    }

    this.mapObject = null;
    this.domElement = null;
    this.placeMarks = [];
    this.polygons = [];
    this._eventHandlers = {};
  }

  static buildStaticUrl(data = {}, options = {}) {
    const img = {
      width: data.width || 600,
      height: data.height || 450,
      zoom: data.zoom || 12,
      latitude: data.latitude || 50.0,
      longitude: data.longitude || 50.0
    };
    const query = {
      l: 'map',
      size: `${img.width},${img.height}`,
      ll: `${img.latitude},${img.longitude}`,
      z: img.zoom
    };

    if (typeof options !== "object") {
      throw new Error('Static url options should be an object');
    }

    const placeMarkTemplate = options.placeMarkTemplate || 'pm2orgm';
    const polygonStrokeColor = options.polygonStrokeColor || 'ff0000';
    const polygonStrokeWidth = options.polygonStrokeWidth || 3;
    const polygonFillColor = options.polygonFillColor || '0afcd0aa';

    if (Array.isArray(data.placeMarks) && data.placeMarks.length) {
      let pms = data.placeMarks.map(pm => {
        // Build URL param from YaPlaceMark object
        if (typeof pm.asStaticUrlParam === 'function') {
          return pm.asStaticUrlParam();
        } // Build URL param from point coordinates


        if (Array.isArray(pm) && pm.length === 2) {
          return pm.join(',') + ',' + placeMarkTemplate;
        }

        return false;
      });
      query.pt = pms.filter(item => !!item).join('~');
    }

    if (Array.isArray(data.polygons) && data.polygons.length) {
      let pgs = data.polygons.map(pg => {
        // Build URL param from YaPolygon object
        if (typeof pg.asStaticUrlParam === 'function') {
          return pg.asStaticUrlParam();
        } // Build url param from plain array of vertexes


        if (Array.isArray(pg) && pg.length > 2) {
          return ['c:' + polygonStrokeColor, 'f:' + polygonFillColor, 'w:' + polygonStrokeWidth].join(',') + ',' + pg.map(vx => vx.join(',')).join(',');
        }

        return false;
      });
      query.pl = pgs.filter(item => !!item).join('~');
    }

    let queryParams = [];

    for (let param in query) {
      if (query.hasOwnProperty(param)) {
        queryParams.push(`${param}=${query[param]}`);
      }
    }

    let baseUrl = "https://static-maps.yandex.ru/1.x/";
    return baseUrl + '?' + queryParams.join('&');
  }
  /**
   * Create map from given dump
   * @param {Object} dump
   */


  static createFromDump(dump) {
    if (typeof dump !== 'object') {
      throw new Error('YaMap dump should be an object');
    }

    let center = dump.center;

    if (!Array.isArray(dump.center)) {
      throw new Error('YaMap dump center property is required');
    }

    let zoom = +dump.zoom;

    if (isNaN(zoom)) {
      throw new Error('YaMap dump zoom property not set or has invalid format');
    }

    const map = new YaMap({
      center,
      zoom
    });

    if (Array.isArray(dump.placeMarks)) {
      dump.placeMarks.forEach(pmDump => {
        map.addPlaceMark(YaPlaceMark.createFromDump(pmDump));
      });
    }

    if (Array.isArray(dump.polygons)) {
      dump.polygons.forEach(pgDump => {
        map.addPolygon(YaPolygon.createFromDump(pgDump));
      });
    }

    return map;
  }
  /**
   * Returns address by given coordinates
   * @param {array|string} coordinates
   * @param {function} cb
   */


  static getAddressByCoordinates(coordinates, cb) {
    let point = YaPoint.from(coordinates);
    loader.load(MAPS_SRC).then(maps => {
      maps.geocode(point.toArray()).then(result => {
        let obj = result.geoObjects.get(0);
        let meta = obj.properties.get('metaDataProperty');
        let parts = meta.GeocoderMetaData.Address.Components;
        if (!parts.length) return null; // Fill up address object

        let address = {
          coordinates: point.toString()
        };
        parts.forEach(p => address[p.kind] = p.name);

        if (typeof cb === "function") {
          return cb(address);
        }
      }).catch(e => console.log(e));
    }).catch(e => console.log(e));
  }
  /**
   * Attempt to search information about
   * @param {string} address
   * @param {function} cb
   */


  static getCoordinatesByAddress(address, cb) {
    if (typeof cb !== 'function') return;
    loader.load(MAPS_SRC).then(maps => {
      maps.geocode(address, {
        results: 1
      }).then(result => {
        let obj = result.geoObjects.get(0);
        cb({
          coordinates: obj.geometry.getCoordinates(),
          bounds: obj.properties.get("boundedBy"),
          country: obj.getCountry(),
          locality: obj.getLocalities().join(', '),
          address: obj.getAddressLine(),
          premise: obj.getPremise() || '',
          house: obj.getPremiseNumber() || ''
        });
      }).catch(e => console.log(e));
    }).catch(e => console.log(e));
  }
  /**
   * Returns map center point
   * @returns {YaPoint}
   */


  getCenter() {
    return this._center;
  }

  /**
   * Set map center from given coordinates
   * @param {String|Array} coordinates
   */
  setCenter(coordinates) {
    this._center = YaPoint.from(coordinates);

    if (this.mapObject) {
      this.mapObject.setCenter(this._center.toArray());
    }
  }

  /**
   * Returns map actual zoom
   * @returns {Number}
   */
  getZoom() {
    return this._zoom;
  }

  /**
   * Set map zoom
   * @param {Number|String} zoom
   */
  setZoom(zoom) {
    if (typeof zoom === 'string') {
      zoom = +zoom;
    }

    if (typeof zoom !== 'number' || isNaN(zoom)) {
      throw new Error('Given zoom value has invalid format');
    }

    if (zoom < 0 || zoom > MAX_ALLOWED_ZOOM) {
      throw new Error('Zoom value is out of allowed range');
    }

    this._zoom = zoom;

    if (this.mapObject) {
      this.mapObject.setZoom(zoom);
    }
  }

  /**
   * Returns URL to the static map image
   * @param {Object} config
   * @returns {String}
   */
  getStaticUrl(config = {}) {
    let [latitude, longitude] = this.getCenter().toArray(true);
    return YaMap.buildStaticUrl({
      zoom: this.getZoom(),
      latitude,
      longitude,
      placeMarks: this.placeMarks,
      polygons: this.polygons,
      width: config.width,
      height: config.height
    });
  }

  /**
   * Init map at the DOM element with given selector
   * @param selector
   */
  bindToElement(selector, cb) {
    const elm = document.querySelector(selector);

    if (!elm) {
      throw new Error(`Unable to find element with selector ${selector} to bind map to`);
    }

    this.domElement = elm;
    loader.load(MAPS_SRC).then(maps => {
      const map = new maps.Map(this.domElement, {
        center: this.getCenter().toArray(),
        zoom: this.getZoom()
      }); // Keep YaMap data in actual state

      map.events.add('boundschange', e => {
        let oldZoom = e.get('oldZoom'),
            newZoom = e.get('newZoom'),
            oldCenter = e.get('oldCenter'),
            newCenter = e.get('newCenter'); // Zoom changed, update wrapper value

        if (oldZoom !== newZoom) {
          this.setZoom(newZoom);
        } // YaMap center shifted, update wrapper value


        if (oldCenter.join(',') !== newCenter.join(',')) {
          this.setCenter(newCenter);
        }
      }); // Bind handlers

      for (let eventName in this._eventHandlers) {
        if (!this._eventHandlers.hasOwnProperty(eventName)) continue;
        let handlers = this._eventHandlers[eventName];
        if (!Array.isArray(handlers)) continue;

        this._eventHandlers[eventName].forEach(handler => {
          map.events.add(eventName, handler);
        });
      }

      this.mapObject = map;
      this.refresh();
      if (typeof cb === 'function') cb(maps);
    });
  }

  /**
   * Unbind and destroy map
   * @param {Boolean} showStatic
   */
  unbindFromElement(showStatic = true) {
    if (!this.mapObject) {
      return false;
    }

    if (showStatic) {
      let s = this.domElement.style;
      s.backgroundPosition = 'center';
      s.backgroundRepeat = 'no-repeat';
      s.backgroundImage = 'url(' + this.getStaticUrl() + ')';
    }

    this.mapObject.destroy(); // Unbind place marks

    this.placeMarks.forEach(pm => {
      pm.rendered = false;
    }); // Unbind polygons

    this.polygons.forEach(pg => {
      pg.rendered = false;
    });
  }

  /**
   * Add place mark object to the map
   * @param {Array} coordinates
   * @param {Object} config
   * @returns {YaPlaceMark}
   */
  addPlaceMark(coordinates, config = {}) {
    const pm = new YaPlaceMark(coordinates, config);
    this.placeMarks.push(pm);
    this.refresh();
    return pm;
  }

  /**
   * Add polygon object to the map
   * @param {Array} vertexes
   * @param {Object} config
   * @returns {YaPolygon}
   */
  addPolygon(vertexes, config) {
    const pg = new YaPolygon(vertexes, config);
    this.polygons.push(pg);
    this.refresh();
    return pg;
  }

  /**
   * Create brand new empty polygon object at the map
   * @param {Boolean} edit Whether to begin edit polygon immediately
   * @returns {YaPolygon}
   */
  createPolygon(edit = true) {
    const pg = this.addPolygon();

    if (edit) {
      pg.startEditing();
    }

    return pg;
  }

  /**
   * Start editing map objects
   */
  startEditing() {
    this.placeMarks.forEach(pm => pm.startEditing());
    this.polygons.forEach(pg => pg.startEditing());
  }

  /**
   * Finish editing map objects
   */
  finishEditing() {
    this.placeMarks.forEach(pm => pm.startEditing());
    this.polygons.forEach(pg => pg.finishEditing()); // Adapt map to new bounds

    if (this.mapObject) {
      this.mapObject.setBounds(this.mapObject.geoObjects.getBounds());
    }
  }

  /**
   * Actualize underlying objects with Ya.Map data
   * @returns {Boolean}
   */
  refresh() {
    if (!this.mapObject) return;
    loader.load(MAPS_SRC).then(maps => {
      // Render place marks
      this.placeMarks.forEach(pm => {
        if (pm.rendered) return;
        let pmGeo = new maps.Placemark(pm.getPosition().toArray(), pm.getOptions(), pm.getConfig());
        this.mapObject.geoObjects.add(pmGeo);
        pm.setGeoObject(pmGeo);
        pm.rendered = true;
      }); // Render polygons

      this.polygons.forEach(pg => {
        if (pg.rendered) return false;
        pg.geoObject = new maps.Polygon([pg.getVertexes().map(vx => vx.toArray())], pg.getOptions(), pg.getConfig());
        this.mapObject.geoObjects.add(pg.geoObject);
        pg.rendered = true;
        pg.startEditing();
      });
    });
  }

  /**
   * Bind event handler to the map
   * @param eventName
   * @param handler
   */
  on(eventName, handler) {
    if (typeof eventName !== 'string' || typeof handler !== 'function') return;

    if (!Array.isArray(this._eventHandlers[eventName])) {
      this._eventHandlers[eventName] = [];
    }

    this._eventHandlers[eventName].push(handler);

    if (this.mapObject) {
      this.mapObject.events.add(eventName, handler);
    }
  }

  onClickGetAddress(cb) {
    if (typeof cb !== 'function') return;
    let placeMark = null;
    this.on('click', e => {
      // Click coordinates
      let coordinates = YaPoint.from(e.get('coords')).toArray();
      YaMap.getAddressByCoordinates(coordinates, cb); // Init placeMark object

      if (null === placeMark) {
        placeMark = this.addPlaceMark(coordinates);
      } else {
        placeMark.setPosition(coordinates);
      }
    });
  }

  /**
   * Mark place with given coordinates on map
   * @param {string|array} coordinates
   * @param {object} config
   * @param {function} cb
   * @returns {*}
   */
  markPlace(coordinates, config, cb) {
    let pm,
        point = YaPoint.from(coordinates);
    this.setCenter(point.toArray());

    if (this.placeMarks.length) {
      pm = this.placeMarks[0].setPosition(point.toArray());
    } else {
      pm = this.addPlaceMark(point.toArray());
    }

    if (typeof cb === 'function') cb(pm);
    return;
  }

  /**
   * Dump map data to portable format
   * @returns {Object}
   */
  dump() {
    return {
      center: this.getCenter().toArray(),
      zoom: this.getZoom(),
      placeMarks: this.placeMarks.map(pm => pm.dump()),
      polygons: this.polygons.map(pg => pg.dump())
    };
  }

}

module.exports = YaMap;

},{"./YaPlaceMark":2,"./YaPoint":3,"./YaPolygon":4,"./loader":6}],2:[function(require,module,exports){
const YaPoint = require('./YaPoint');

class YaPlaceMark {
  /**
   * @param {Array|String} coordinates
   * @param {Object} options
   */
  constructor(coordinates, options = {}) {
    if (!Array.isArray(coordinates) && typeof coordinates !== 'string') {
      throw new Error('YaPlaceMark: coordinates param should be an array or string');
    }

    if (options && typeof options !== 'object') {
      throw new Error('YaPlaceMark: options param should be an object');
    }

    this._geoObject = null;
    this.rendered = false;
    this.setPosition(coordinates);
    this.text = options.text || '';
    this.hint = options.hint || '';
    this.caption = options.caption || '';
    this.balloon = options.balloon || '';
    this.color = options.color || '#3a64ff';
    this.preset = options.preset || '';
    this.draggable = options.draggable || false;
  }
  /**
   * Create place mark object from dump
   * @param {Object} dump
   * @returns {YaPlaceMark}
   */


  static createFromDump(dump) {
    if (typeof dump !== 'object') {
      throw new Error('Create placeMark from dump: dump is not an object');
    }

    if (!Array.isArray(dump.coordinates) && typeof dump.coordinates !== 'string') {
      throw new Error('Create placeMark from dump: coordinates value is invalid');
    }

    if (typeof dump.options !== 'object') {
      dump.options = {};
    }

    return new YaPlaceMark(dump.coordinates, dump.options);
  }

  /**
   * @param {Array|String} coordinates
   */
  setPosition(coordinates) {
    this._position = YaPoint.from(coordinates);

    if (this._geoObject) {
      this._geoObject.geometry.setCoordinates(coordinates);
    }
  }

  /**
   * Returns current placeMark position
   * @returns {Position}
   */
  getPosition() {
    return this._position;
  }

  /**
   * @param {Object} pmGeo
   */
  setGeoObject(pmGeo) {
    if (typeof pmGeo !== 'object') {
      throw new Error('GeoObject is not an object');
    }

    if (typeof pmGeo.events === 'undefined') {
      throw new Error('GeoObject is invalid');
    }

    this._geoObject = pmGeo;
    pmGeo.events.add('dragend', () => {
      this.setPosition(this._geoObject.geometry.getCoordinates());
    });
  }

  /**
   * Reset link to geoObject
   */
  unsetGeoObject() {
    this._geoObject = null;
  }

  /**
   * @returns {Object|null}
   */
  getGeoObject() {
    return this._geoObject;
  }

  /**
   * @return {Object}
   */
  getOptions() {
    return {
      iconContent: this.text,
      hintContent: this.hint,
      iconCaption: this.caption,
      balloonContent: this.balloon
    };
  }

  /**
   * @returns {Object}
   */
  getConfig() {
    let preset = '';

    if (this.preset && this.preset.length) {
      preset = this.preset;
    } else if (this.text.length) {
      preset = 'islands#blackStretchyIcon';
    }

    return {
      iconColor: this.color,
      draggable: this.draggable,
      preset: preset
    };
  }

  /**
   * Make placeMark editable
   * @returns {Object}
   */
  startEditing() {
    this.draggable = true;

    if (this.geoObject) {
      this.geoObject.options.set('draggable', true);
    }
  }

  /**
   * Make placeMark non-editable
   */
  finishEditing() {
    this.draggable = false;

    if (this.geoObject) {
      this.geoObject.options.set('draggable', false);
    }
  }

  /**
   * Prepare placeMark object transformable data
   * @returns {Object}
   */
  dump() {
    return {
      coordinates: this.getPosition().toArray(),
      options: {
        text: this.text,
        hint: this.hint,
        caption: this.caption,
        balloon: this.balloon,
        color: this.color
      }
    };
  }

}

module.exports = YaPlaceMark;

},{"./YaPoint":3}],3:[function(require,module,exports){
class YaPoint {
  /**
   * @param {Number|String} latitude  12.345 | "12.345"
   * @param {Number|String} longitude 12.345 | "12.345"
   */
  constructor(latitude, longitude) {
    // Check validity and set latitude
    latitude = parseFloat(latitude);

    if (isNaN(latitude)) {
      throw new Error('Latitude has invalid format');
    }

    this.latitude = latitude; // Check validity and set longitude

    longitude = parseFloat(longitude);

    if (isNaN(longitude)) {
      throw new Error('Longitude has invalid format');
    }

    this.longitude = longitude;
  }
  /**
   * Create YaPoint object from coordinates in string format
   * @param {String} cStr "<latitude>,<longitude>"
   * @returns {YaPoint}
   */


  static fromString(cStr) {
    if (typeof cStr !== 'string') {
      throw new Error('Given param is not a string');
    }

    let coordinates = cStr.split(',');

    if (coordinates.length !== 2) {
      throw new Error('Coordinates string has invalid format');
    }

    return new YaPoint(coordinates[0], coordinates[1]);
  }
  /**
   * Creates point object from coordinates in array format
   * @param {Array} cArr [<latitude>,<longitude>]
   * @returns {YaPoint}
   */


  static fromArray(cArr) {
    if (!Array.isArray(cArr)) {
      throw new Error('Given `coordinates` param is not an array');
    }

    if (cArr.length !== 2) {
      throw new Error('Given `coordinates` array should have exactly 2 elements');
    }

    return new YaPoint(cArr[0], cArr[1]);
  }
  /**
   * Creates point from either string or array format
   * @param {String|Array} coordinates
   * @returns {YaPoint}
   */


  static from(coordinates) {
    if (coordinates instanceof YaPoint) {
      return coordinates;
    }

    if (typeof coordinates === 'string') {
      return YaPoint.fromString(coordinates);
    }

    if (Array.isArray(coordinates)) {
      return YaPoint.fromArray(coordinates);
    }

    throw new Error(typeof coordinates + ' is invalid coordinates format');
  }

  /**
   * Convert point to array format: [<latitude>,<longitude>]
   * @param {Boolean} reversed Whether to return coordinates in reversed order
   * @returns {Array}
   */
  toArray(reversed = false) {
    let coordinates = [this.latitude, this.longitude];
    return reversed ? coordinates.reverse() : coordinates;
  }

  /**
   * Convert point to string format: "<latitude>,<longitude>"
   * @param {Boolean} reversed Whether to return coordinates in reversed order
   * @returns {string}
   */
  toString(reversed) {
    return this.toArray(reversed).join(',');
  }

}

module.exports = YaPoint;

},{}],4:[function(require,module,exports){
const YaPoint = require('./YaPoint');

const DEFAULT_STROKE_WIDTH = 3;
const DEFAULT_STROKE_COLOR = '4038ff';
const DEFAULT_FILL_COLOR = 'ffdb62';

class YaPolygon {
  /**
   * @param {Array} vertexes
   * @param {Object} config
   */
  constructor(vertexes, config = {}) {
    if (typeof config !== 'object') {
      throw new Error('Polygon config should be an object');
    }

    this._vertexes = [];

    if (Array.isArray(vertexes)) {
      this.loadVertexes(vertexes); // TODO: Maybe check if first point is the same with last?
    } // Set valid polygon stroke color


    this.strokeColor = DEFAULT_STROKE_COLOR;

    if (typeof config.strokeColor === 'string') {
      this.strokeColor = config.strokeColor.replace('#', '');
    } // Set valid polygon stroke with


    this.strokeWidth = DEFAULT_STROKE_WIDTH;

    if (typeof config.strokeWidth === 'number') {
      this.strokeWidth = +config.strokeWidth;
    } // Set valid polygon stroke color


    this.fillColor = DEFAULT_FILL_COLOR;

    if (typeof config.fillColor === 'string') {
      this.fillColor = config.fillColor.replace('#', '');
    }

    this.opacity = config.opacity || 0.8;
    this.rendered = false;
    this.edited = false;
    this.geoObject = null;
  }
  /**
   * Load vertexes to polygon
   * @param vertexes
   */


  loadVertexes(vertexes) {
    if (!Array.isArray(vertexes)) {
      throw new Error('Vertexes should be in array format');
    }

    this._vertexes = vertexes.map(vx => YaPoint.from(vx));
  }

  /**
   * Returns an array of polygon vertexes
   * @returns {YaPoint[]}
   */
  getVertexes() {
    return this._vertexes;
  }

  /**
   * List of polygon options
   * @returns {{}}
   */
  getOptions() {
    return {};
  }

  /**
   * Polygon configuration object
   * @returns {{editorDrawingCursor: string, strokeWidth: *, strokeColor: string, fillColor: string, opacity: *}}
   */
  getConfig() {
    return {
      editorDrawingCursor: 'crosshair',
      strokeWidth: this.strokeWidth,
      strokeColor: '#' + this.strokeColor,
      fillColor: '#' + this.fillColor,
      opacity: this.opacity
    };
  }

  /**
   * Turn polygon into edit mode
   * @returns {boolean}
   */
  startEditing() {
    if (!this.geoObject) {
      console.log('Cannot startEditing polygon: geoObject not initialized yet');
      return false;
    }

    if (!this.getVertexes().length) {
      this.geoObject.editor.startDrawing();
    } else {
      this.geoObject.editor.startEditing();
    }

    this.edited = true;
  }

  /**
   * Turn polygon edit mode off
   */
  finishEditing() {
    if (!this.edited) return;
    this.geoObject.editor.stopDrawing();
    this.geoObject.editor.stopEditing();
    this.loadVertexes(this.geoObject.geometry.getCoordinates()[0]);
    this.edited = false;
  }

  /**
   * Dump polygon data into processable object
   * @returns {string}
   */
  dump() {
    let data = {
      vertexes: this.getVertexes().map(vx => vx.toArray()),
      config: {
        strokeWidth: this.strokeWidth,
        strokeColor: this.strokeColor,
        fillColor: this.fillColor,
        opacity: this.opacity
      }
    };
    return JSON.stringify(data);
  }

  /**
   * Preset polygon as static URL param
   * NOTE: In static URL mode coordinates presented in reversed order [LON, LAT]
   * @returns {string}
   */
  asStaticUrlParam() {
    return ['c:' + this.strokeColor, 'f:' + this.fillColor, 'w:' + this.strokeWidth].join(',') + ',' + this.getVertexes().map(vx => vx.toString(true)).join(',');
  }

}

module.exports = YaPolygon;

},{"./YaPoint":3}],5:[function(require,module,exports){
const YaMap = require('./YaMap');

let map = new YaMap();
map.bindToElement('#map');

},{"./YaMap":1}],6:[function(require,module,exports){
(function (global){
const DEFAULT_API_URL = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
module.exports = {
  load: function (src) {
    src = src || DEFAULT_API_URL;
    this.promise = this.promise || new Promise((resolve, reject) => {
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;
      script.onload = resolve;

      script.onerror = function (e) {
        return reject(e);
      };

      document.body.appendChild(script);
    }).then(() => {
      return new Promise(resolve => {
        if (!global.ymaps) {
          throw new Error('ymaps object does not exist in global scope');
        }

        if (typeof global.ymaps.ready !== 'function') {
          throw new Error('ymaps object has invalid format');
        }

        return global.ymaps.ready(resolve);
      });
    });
    return this.promise;
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[5]);

//# sourceMappingURL=maps/map.js.map
