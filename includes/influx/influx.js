const DEBUG = true;

//Includes
var influx_module = require('influx');
const FieldType = influx_module.FieldType

var influx = '';

exports.connect = function(settings) {
  // Create influx db
  influx.getDatabaseNames()
    .then(names => {
      if (!names.includes(influx_db_name)) {
        if (DEBUG) console.log('[DEBUG] Creating database: %j', influx_db_name);
        return influx.createDatabase(influx_db_name);
      }
      else {
        if (DEBUG) console.log('[DEBUG] Database found, not recreating.');
      }
    })
    .catch(err => {
      console.error('[ERROR] Error creating Influx database!');
    });

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

  if(DEBUG) console.log("[DEBUG] Connected to Influx.");

};
