const YaMap = require('./YaMap');

let map = new YaMap();
map.bindToElement('#map');

let status = true;
document.addEventListener('click', function() {
    status ? map.unbindFromElement() : map.bindToElement('#map');
    status = !status;
});



