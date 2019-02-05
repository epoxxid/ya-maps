const LAT = 12.345;
const LON = -54.321;

const geoData = {
    latitude: LAT,
    longitude: LON,
    coordArr: [LAT, LON],
    coordArrReversed: [LON, LAT],
    coordStr: `${LAT},${LON}`,
    coordStrReversed: `${LON},${LAT}`,
    invalidCoordinates: [
        '',
        '12.345',
        '12.345,54.321,12.345',
        1,
        [],
        [12.345],
        [12.345, 54.321, 12.345],
        null,
        undefined,
        true,
        {}
    ],
    // Yandex.Maps geoObject mock
    yandexGeoObject: {
        events: {
            add: function() {}
        }
    }
};

module.exports = geoData;