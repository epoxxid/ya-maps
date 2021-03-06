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
            z: img.zoom,
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
                }
                // Build URL param from point coordinates
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
                }
                // Build url param from plain array of vertexes
                if (Array.isArray(pg) && pg.length > 2) {
                    return [
                        'c:' + polygonStrokeColor,
                        'f:' + polygonFillColor,
                        'w:' + polygonStrokeWidth
                    ].join(',') + ',' + pg.map(vx => vx.join(',')).join(',');
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

        const map = new YaMap({center, zoom});

        if (Array.isArray(dump.placeMarks)) {
            dump.placeMarks.forEach(pmDump => {
                map.addPlaceMark(YaPlaceMark.createFromDump(pmDump));
            });
        }

        if (Array.isArray(dump.polygons)) {
            dump.polygons.forEach(pgDump => {
                map.addPolygon(YaPolygon.createFromDump(pgDump))
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

                if (!parts.length) return null;

                // Fill up address object
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
            maps.geocode(address, {results: 1}).then(result => {
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
    };

    /**
     * Set map center from given coordinates
     * @param {String|Array} coordinates
     */
    setCenter(coordinates) {
        this._center = YaPoint.from(coordinates);
        if (this.mapObject) {
            this.mapObject.setCenter(this._center.toArray());
        }
    };

    /**
     * Returns map actual zoom
     * @returns {Number}
     */
    getZoom() {
        return this._zoom;
    };

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
    };


    /**
     * Returns URL to the static map image
     * @param {Object} config
     * @returns {String}
     */
    getStaticUrl(config = {}) {
        let [latitude, longitude] = this.getCenter().toArray(true);

        if (this.domElement) {
            config.width = config.width || this.domElement.offsetWidth;
            config.height = config.height || this.domElement.offsetHeight;
        }

        return YaMap.buildStaticUrl({
            zoom: this.getZoom(),
            latitude,
            longitude,
            placeMarks: this.placeMarks,
            polygons: this.polygons,
            width: config.width,
            height: config.height
        });
    };

    /**
     * Init map at the DOM element with given selector
     * @param target
     * @param {function} cb
     */
    bindToElement(target, cb) {

        if (target instanceof HTMLElement) {
            this.domElement = target;
        } else if (typeof target === 'string') {
            this.domElement = document.querySelector(target);
            if (!this.domElement) {
                throw new Error(`Unable to find element with selector ${target} to bind map to`);
            }
        }

        loader.load(MAPS_SRC).then(maps => {

            const map = new maps.Map(this.domElement, {
                center: this.getCenter().toArray(),
                zoom: this.getZoom()
            });

            // Keep YaMap data in actual state
            map.events.add('boundschange', e => {
                let oldZoom = e.get('oldZoom'),
                    newZoom = e.get('newZoom'),
                    oldCenter = e.get('oldCenter'),
                    newCenter = e.get('newCenter');

                // Zoom changed, update wrapper value
                if (oldZoom !== newZoom) {
                    this.setZoom(newZoom);
                }

                // YaMap center shifted, update wrapper value
                if (oldCenter.join(',') !== newCenter.join(',')) {
                    this.setCenter(newCenter);
                }
            });

            // Bind handlers
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

            if (typeof cb === 'function') cb(this);             
        });
    };

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

        this.mapObject.destroy();

        // Unbind place marks
        this.placeMarks.forEach(pm => {
            pm.rendered = false
        });

        // Unbind polygons
        this.polygons.forEach(pg => {
            pg.rendered = false
        });
    };

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
    };

    /**
     * Remove given place mark from object
     * @param {YaPlaceMark} pm
     */
    removePlaceMark(pm) {
        let idx = this.placeMarks.indexOf(pm);

        if (idx === -1) {
            throw new Error('Unable to delete polygon: map does not contain given object');
        }

        if (this.mapObject) {
            this.mapObject.geoObjects.remove(pm.getGeoObject());
        }

        this.placeMarks.splice(idx, 1);
    };

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
    };

    /**
     * Remove polygon from the map
     * @param {YaPolygon} pg
     */
    removePolygon(pg) {
        let idx = this.polygons.indexOf(pg);

        if (idx === -1) {
            throw new Error('Unable to delete polygon: map does not contain given object');
        }

        if (this.mapObject) {
            this.mapObject.geoObjects.remove(pg.getGeoObject());
        }

        this.polygons.splice(idx, 1);
    };

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
    };

    /**
     * Start editing map objects
     */
    startEditing() {
        this.placeMarks.forEach(pm => pm.startEditing());
        this.polygons.forEach(pg => pg.startEditing());
    };

    /**
     * Finish editing map objects
     */
    finishEditing() {
        this.placeMarks.forEach(pm => pm.startEditing());
        this.polygons.forEach(pg => pg.finishEditing());

        // Adapt map to new bounds
        if (this.mapObject) {
            this.mapObject.setBounds(this.mapObject.geoObjects.getBounds());
        }
    };

    /**
     * Actualize underlying objects with Ya.Map data
     * @returns {Boolean}
     */
    refresh() {
        if (!this.mapObject) return;

        loader.load(MAPS_SRC).then((maps) => {

            // Render place marks
            this.placeMarks.forEach(pm => {
                if (pm.rendered) return;

                let geoObject = new maps.Placemark(
                    pm.getPosition().toArray(),
                    pm.getOptions(),
                    pm.getConfig()
                );

                pm.setGeoObject(geoObject);
                this.mapObject.geoObjects.add(geoObject);
                pm.rendered = true;
            });

            // Render polygons
            this.polygons.forEach(pg => {
                if (pg.rendered) return;

                let geoObject = new maps.Polygon(
                    [pg.getVertexes().map(vx => vx.toArray())],
                    pg.getOptions(),
                    pg.getConfig()
                );

                pg.setGeoObject(geoObject);
                this.mapObject.geoObjects.add(geoObject);
                pg.rendered = true;
            });
        });
    };

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

        this.on('click', e => {
            // Click coordinates
            let coordinates = YaPoint.from(e.get('coords')).toArray();
            this.markPlace(coordinates);
            YaMap.getAddressByCoordinates(coordinates, cb);
        });
    };

    /**
     * Mark place with given coordinates on map
     * @param {string|array} coordinates
     * @param {object} config
     * @param {function} cb
     * @returns {*}
     */
    markPlace(coordinates, config, cb) {
        let pm, point = YaPoint.from(coordinates);

        this.setCenter(point.toArray());

        if (this.placeMarks.length) {
            pm = this.placeMarks[0].setPosition(point.toArray());
        } else {
            pm = this.addPlaceMark(point.toArray());
        }

        if (typeof cb === 'function') cb(pm);

        return pm;
    };

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
    };
}

module.exports = YaMap;