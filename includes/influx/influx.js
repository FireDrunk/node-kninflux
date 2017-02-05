const DEBUG = true;

//Includes
const Influx = require('influx');
const FieldType = Influx.FieldType

var influx = '';
var callbacks = [];

exports.register_callback = function(name, func) {
  callbacks[name] = func;
};

exports.connect = function(settings) {
  // Connect
  influx = new Influx.InfluxDB({
	  host: settings.influx_db_host || '127.0.0.1',
	  database: settings.influx_db_name || 'knx_db',
  	schema: [
  	  {
    		measurement: settings.influx_db_table_name || 'knx_values',
    		fields: {
    			knx_address: Influx.FieldType.STRING,
    			knx_value: Influx.FieldType.FLOAT
    		},
    		tags: [
    			'name'
    		]
  	  }
  	]
  });

  // Create influx db
  influx.getDatabaseNames()
    .then(names => {
      if (!names.includes(influx_db_name)) {
        if (DEBUG) console.log('[DEBUG] Creating database: %j', influx_db_name);
        influx.createDatabase(influx_db_name);
        if ("on_connected" in callbacks) {
          callbacks["on_connected"]();
        }
        else {
          console.log('[ERROR] No callback registered vor on_connected!');
        }
      }
      else {
        if (DEBUG) console.log('[DEBUG] Database found, not recreating.');
      }
    })
    .catch(err => {
      console.error('[ERROR] Error creating Influx database: %j', err);
    });
};
