var fs = require('fs'),
  Geocode = require('./geocode.js'),
  config = require('../config');

var mapzenApiKey = config.mapzen.apiKey;
var mapzenApiRoot = config.mapzen.apiRoot;

// // catch when a bad call is made
// console.log('\nWill return error if address is blank');
// var response = Geocode.geocode({
//   address: '',
//   root: mapzenApiRoot,
//   api_key: mapzenApiKey
// });
// console.log(response);

// // catch when a bad call is made
// console.log('\nWill return error if api key is wrong');
// var response2 = Geocode.geocode({
//   address: '100 Holiday St, Baltimore, MD',
//   root: mapzenApiRoot,
//   api_key: mapzenApiKey + mapzenApiKey
// });
// console.log(response2);

// // process an address from an intersection
// console.log('\nWill handle an address from an intersection');
// var response3 = Geocode.geocode({
//   address: 'Eislen St & W Camden St, Baltimore, MD',
//   root: mapzenApiRoot,
//   api_key: mapzenApiKey
// });
// console.log('query: ', response3.geocoding.query, '\ncoordinates: ' + response3.features[0].geometry.coordinates);

// returns a response from a bad address
console.log('\nWill fallback to city of baltmore centroid with an imcomplete address');
var response4 = Geocode.geocode({
  address: 'E MT VERNON PL,baltimore,md',
  root: mapzenApiRoot,
  api_key: mapzenApiKey
});
console.log(JSON.stringify(response4));
console.log('query: ', response4.geocoding.query, '\ncoordinates: ' + response4.features[0].geometry.coordinates);


// // process a good address
// console.log('\nWill handle a good address');
// var response5 = Geocode.geocode({
//   address: '22 S Greene St ,baltimore,md',
//   root: mapzenApiRoot,
//   api_key: mapzenApiKey
// });
// console.log('query: ', response5.geocoding.query, '\ncoordinates: ' + response5.features[0].geometry.coordinates);

// // batch over some addresses
// Add addresses to addresses.csv in this folder to test how it handles different addresses
// fs.readFile('./addresses.csv', 'utf8', function(err, data) {
//   var dataArr = data.trim().split('\n');
//   var counter = 1;
//   dataArr.forEach(function(address) {
//     if (counter) {
//       console.log(`\nprocessing address ${counter}:`, address);
//       var response = Geocode.geocode({
//         address: address,
//         root: mapzenApiRoot,
//         api_key: mapzenApiKey
//       });
//       counter ++;
//       console.log('query: ', response.geocoding.query, '\ncoordinates: ' + response.features[0].geometry.coordinates);
//     }
//   });
// });
