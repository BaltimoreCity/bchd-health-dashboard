var path = require('path'),
  https = require('https'),
  childProcess = require('child_process'),
  mongoose = require('mongoose'),
  AddressSchema = require(path.resolve('modules/geo/server/models/address.server.model.js')),
  Address = mongoose.model('Address'),
  _ = require('lodash');

// basic geocoder functions
module.exports = {

  // cache the address for later
  cacheGeocode: function(addr, response) {
    Address.findOne({ 'addr': addr }).exec(function (err, record) {
      if (err) {
        console.log('There as a problem connecting to the Address Model');
        return;
      } else {
        var record;

        var recordJson = {
          'addr': addr,
          geocodeResponse: {},
          matchType: null,
          coordinates: {
            latitude: null,
            longitude: null
          }
        }
        if (response && response.features && response.features[0]) {
          recordJson.geocodeResponse = response;
          if (response.features[0].properties && response.features[0].properties.match_type) {
            recordJson.matchType = response.features[0].properties.match_type;
          }
          if (response.features[0].geometry && response.features[0].geometry.coordinates ) {
            recordJson.coordinates.longitude = response.features[0].geometry.coordinates[0];
            recordJson.coordinates.latitude = response.features[0].geometry.coordinates[1];
          }
        }

        if (record) {
          record = _.extend(record, recordJson);
        } else {
          record = new Address(recordJson);
        }

        record.save(function(err) {
          if (err) { console.log('Error caching geocode respose'); }
        });
      }
    });
  },

  // check if the address is present and if so, perform an http call to the geocoder
  geocode: function(options) {
    if (this.emptyValue(options) || this.emptyValue(options.address)) {
      return { error: 'Address cannot be empty!' };
    } else {
      var addr = options.address.replace(/'/g, "''");
      var safe_addr = encodeURIComponent(addr);
      var url = options.root + 'api_key=' + options.api_key + '&text=' + safe_addr;
      var new_response = this.curlHttpRequest(url);
      this.cacheGeocode(addr, new_response);
      return new_response;
    }
  },

  // generate a curl request
  curlHttpRequest: function(url) {
    var default_timeout = 2;
    // add the http_code to the output so we can see it later
    var command = `curl -s -w " http_code: %{http_code}" -m ${default_timeout} --connect-timeout ${default_timeout} "${url}"`;
    var response;
    try {
      response = childProcess.execSync(command);
      response = response.toString();

      // check the http_code and if it is good, return the response, else, return the error.
      if (response.match(/http_code: 200/)) {
        response = JSON.parse(response.split(' http_code')[0]);
      } else {
        response = { error: 'An API error occurred: ' + response };
      }

    // catch any other errors in the above block.
    } catch (err) {
      response = { error: 'Error encountered in cURL request: ' + err };
    }
    return response;
  },

  // make the request async with node http
  // not using this one, tried to use but the db write would get stuck inside the callback.
  nodeHttpRequest: function(url) {
    https.get(url, function(res) {
      var body = '';

      res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('end', function() {
        if (res.statusCode === 200) {
          var geocodeResp = JSON.parse(body);
          console.log('Got a response: ');
          console.log(geocodeResp.features[1].geometry);
        } else {
          console.log('Something went wrong: ', body);
        }
      });
    }).on('error', function(e) {
      console.log('Got an error: ', e);
    });
  },

  // helper for checking an empty value
  emptyValue: function(value) {
    return (value === '' || value === null || value === undefined);
  }
};

/*
Simple Mapzen geocode module:
This module takes an address and sends a curl to the Mapzen geocode API service to try to convert
the address into latitude longitude.

An example call to this module:

var mapzenApiKey = "<mapzenApiKey>";
var mapzenApiRoot = "https://search.mapzen.com/v1/search?";
var response = Geocode.geocode({
  address: '<address>',
  root: mapzenApiRoot,
  api_key: mapzenApiKey + mapzenApiKey
});

the response will contain the JSON geocoder response, or an error message.
A successful geocoder response will return a geoJson structure:
{
  geocoding:{
    ...
    query: { contains the input query}
    ...
  },
  type: 'FeatureCollection',
  features: [ //an array of geojsons
    {
      type: 'Feature'
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      properties : {mapzen geocoder location details},
      bbox: [xmin, ymin, xmax, ymax of a box that contains the feature]
    },{more features}
  ]
}

for the most part, the most important output of the geocode response is the coordinates:
  response.features[0].geometry.coordinates
In general, the first geocode response will be the 'closest' and have the highest 'confifence'
*/
