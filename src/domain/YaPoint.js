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
        this.latitude = latitude;

        // Check validity and set longitude
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
    };

    /**
     * Convert point to array format: [<latitude>,<longitude>]
     * @param {Boolean} reversed Whether to return coordinates in reversed order
     * @returns {Array}
     */
    toArray(reversed = false) {
        let coordinates = [this.latitude, this.longitude];
        return reversed ? coordinates.reverse() : coordinates;
    };

    /**
     * Convert point to string format: "<latitude>,<longitude>"
     * @param {Boolean} reversed Whether to return coordinates in reversed order
     * @returns {string}
     */
    toString(reversed) {
        return this.toArray(reversed).join(',');
    };
}

exports.default = YaPoint;