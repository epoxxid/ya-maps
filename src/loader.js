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
            return new Promise((resolve) => {
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