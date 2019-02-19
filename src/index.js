const YaMap = require('./YaMap');

// let map = new YaMap();
// map.bindToElement('#map');
//
// map.onClickGetAddress(function(data) {
//     console.log(data);
// });

YaMap.getCoordinatesByAddress('Армавир, Энгельса, 100', function(info) {
    console.log(info);
});


// let status = true;
// document.addEventListener('click', function() {
//     status ? map.unbindFromElement() : map.bindToElement('#map');
//     status = !status;
// });
//
//



