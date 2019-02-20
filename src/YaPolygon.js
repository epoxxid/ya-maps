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
            this.loadVertexes(vertexes);
            // TODO: Maybe check if first point is the same with last?
        }

        // Set valid polygon stroke color
        this.strokeColor = DEFAULT_STROKE_COLOR;
        if (typeof config.strokeColor === 'string') {
            this.strokeColor = config.strokeColor.replace('#', '');
        }

        // Set valid polygon stroke with
        this.strokeWidth = DEFAULT_STROKE_WIDTH;
        if (typeof config.strokeWidth === 'number') {
            this.strokeWidth = +config.strokeWidth;
        }

        // Set valid polygon stroke color
        this.fillColor = DEFAULT_FILL_COLOR;
        if (typeof config.fillColor === 'string') {
            this.fillColor = config.fillColor.replace('#', '');
        }

        this.opacity = config.opacity || 0.8;

        this.rendered = false;
        this.edited = false;

        this._geoObject = null;
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
    };

    /**
     * Returns an array of polygon vertexes
     * @returns {YaPoint[]}
     */
    getVertexes() {
        return this._vertexes;
    };

    /**
     * List of polygon options
     * @returns {{}}
     */
    getOptions() {
        return {};
    };

    /**
     * @returns {Object|undefined}
     */
    getGeoObject() {
        return this._geoObject;
    }

    /**
     * @param geoObject
     * @returns {YaPolygon}
     */
    setGeoObject(geoObject) {
        this._geoObject = geoObject;
        return this;
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
            opacity: this.opacity,
        };
    };

    /**
     * Turn polygon into edit mode
     * @returns {boolean}
     */
    startEditing() {
        if (!this._geoObject) {
            console.log('Cannot startEditing polygon: geoObject not initialized yet');
            return false;
        }

        if (!this.getVertexes().length) {
            this._geoObject.editor.startDrawing();
        } else {
            this._geoObject.editor.startEditing();
        }

        this.edited = true;
    };

    /**
     * Turn polygon edit mode off
     */
    finishEditing() {
        if (!this.edited) return;

        this._geoObject.editor.stopDrawing();
        this._geoObject.editor.stopEditing();

        this.loadVertexes(this._geoObject.geometry.getCoordinates()[0]);
        this.edited = false;
    };

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
    };

    /**
     * Preset polygon as static URL param
     * NOTE: In static URL mode coordinates presented in reversed order [LON, LAT]
     * @returns {string}
     */
    asStaticUrlParam() {
        return [
            'c:' + this.strokeColor,
            'f:' + this.fillColor,
            'w:' + this.strokeWidth
        ].join(',') + ',' + this.getVertexes().map(vx => vx.toString(true)).join(',');
    };
}

module.exports = YaPolygon;