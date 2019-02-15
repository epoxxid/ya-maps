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
    };


    /**
     * @param {Array|String} coordinates
     */
    setPosition(coordinates) {
        this._position = YaPoint.from(coordinates);
    };

    /**
     * Returns current placeMark position
     * @returns {Position}
     */
    getPosition() {
        return this._position;
    };

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
    };

    /**
     * Reset link to geoObject
     */
    unsetGeoObject() {
        this._geoObject = null;
    };

    /**
     * @returns {Object|null}
     */
    getGeoObject() {
        return this._geoObject;
    };

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
    };

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
    };

    /**
     * Make placeMark editable
     * @returns {Object}
     */
    startEditing() {
        this.draggable = true;
        if (this.geoObject) {
            this.geoObject.options.set('draggable', true);
        }
    };

    /**
     * Make placeMark non-editable
     */
    finishEditing() {
        this.draggable = false;
        if (this.geoObject) {
            this.geoObject.options.set('draggable', false);
        }
    };

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
                color: this.color,
            }
        };
    };
}

module.exports = YaPlaceMark;