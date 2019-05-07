var path = require('path'),
  config = require(path.resolve('config/config'));

var { Pool } = require('pg');
var pool = new Pool({
  connectionString: config.psDB.uri,
  connectionTimeoutMillis: config.psDB.connection_timeout
});

var census_tracts = require('./baltimore_census_tracts_2016');

var CURRENT_TABLE = 'public.baltimore_census_tracts_2016';

// this makes geojson output possible
function FeatureCollection() {
  this.type = 'FeatureCollection';
  this.features = [];
}

function Feature() {
  this.type = 'Feature';
  this.geometry = {};
  this.properties = {};
}

exports.censusTractFromIntersects = function(req, res) {
  var X = req.query.X,
    Y = req.query.Y;

  exports.censusTractFromIntersectsInternal(X, Y, function(obj) {
    if (obj.censusTract) {
      res.jsonp(obj);
    } else {
      console.log(`intersects: bad request: ${req}`);
      return res.status(400).send(obj.message);
    }
  });
};

exports.censusTractFromIntersectsInternal = function(X, Y, callback) {
  if (X && Y) {
    pool.connect((err, client, release) => {
      if (err) {
        return callback({
          message: 'Error acquiring postgres client'
        });
      }
      client.query('select tractce, total_pop_2010 from ' + CURRENT_TABLE +
        ` where ST_intersects(geom, ST_GeographyFromText('SRID=4326;POINT( ${X} ${Y})'));`)
      .then(function(result) {
        client.release();
        if (!result.rowCount || result.rowCount <= 0) {
          callback({
            message: 'No census tract found'
          });
        } else {
          callback({
            censusTract: result.rows[0].tractce,
            totalPopulation2010: result.rows[0].total_pop_2010
          });
        }
      })
      .catch(function(err) {
        client.release();
        console.log('here', err.stack);
        callback({
          message: err.stack
        });
      });
    });
  } else {
    callback({
      message: 'Intersect not defined'
    });
  }
};

// just return the local resource
function localFeatures(req, res) {
  res.jsonp(census_tracts.features);
}

function requestFeatures(req, res) {
  var client;
  pool.connect()
  .then(function(client) {
    client.query(`SELECT jsonb_build_object(
      'type',     'FeatureCollection',
      'features', jsonb_agg(feature)
    ) FROM (
      SELECT jsonb_build_object(
        'type',       'Feature',
        'id',         gid,
        'geometry',   ST_AsGeoJSON((ST_DUMP(geom)).geom)::jsonb,
        'properties', to_jsonb(row) - 'gid' - 'geom'
      ) AS feature
      FROM (SELECT * FROM baltimore_census_tracts_2016) row
    ) features;`)
    .then(function(result) {
      client.release();
      if (!result.rowCount || result.rowCount <= 0) {
        return res.status(400).send({
          message: 'No census tract found'
        });
      } else {
        res.jsonp(result.rows[0].jsonb_build_object.features);
      }
    })
    .catch(function(err) {
      client.release();
      console.log(err.stack);
      return res.status(400).send({
        message: err.stack
      });
    });
  })
  .catch(function(err) {
    client.release();
    console.log(err.stack);
    return res.status(400).send({
      message: err.stack
    });
  });
}

exports.censusTractFeatures = function(req, res) {
  localFeatures(req, res);
  // requestFeatures(req, res);
};
