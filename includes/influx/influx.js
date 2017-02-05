const DEBUG = true;

//Includes
const Influx = require('influx');
const FieldType = Influx.FieldType

var influx = '';
var callbacks = [];
var global_settings = '';

exports.register_callback = function(name, func) {
  callbacks[name] = func;
};

exports.write_data_point = function(name,src,value) {
  influx.writePoints([
    {
      measurement: settings.influx_db_measurement_name || 'knx_values',
      tags: {name: name},
      fields: {knx_address: src, knx_value: value},
    }
  ]).then(result => {
    if(DEBUG) console.log("[DEBUG] Written (%j, %j, %j) to Influx.", name, src, value);
  }).catch(err => {
    console.error("[ERROR] Error writing to InfluxDB: %j", err);
  });
}

exports.connect = function(settings) {
  // Print settings
  if (DEBUG) console.log("[DEBUG] Received Settings: %j", settings);

  // Connect
  influx = new Influx.InfluxDB({
    host: settings.influx_db_host || "127.0.0.1",
    port: settings.influx_db_port || "8086",
    database: settings.influx_db_name || 'knx_db',
    schema: [{
      measurement: settings.influx_db_measurement_name || 'knx_values',
  		fields: {
  			knx_address: Influx.FieldType.STRING,
  			knx_value: Influx.FieldType.FLOAT
  		},
  		tags: [
  			'name'
  		]
	  }]
  });

  // Create influx db
  influx.getDatabaseNames()
    .then(names => {
      // Check if we need to create the database
      if (!names.includes(settings.influx_db_name || "knx_db")) {
        if (DEBUG) console.log('[DEBUG] Creating database: %j', settings.influx_db_name || "knx_db");
        influx.createDatabase(settings.influx_db_name);
      }
      else {
        if (DEBUG) console.log('[DEBUG] Database found, not recreating.');
      }

      // Call callback
      if ("on_connected" in callbacks) {
        callbacks["on_connected"]();
      }
      else {
        console.error('[ERROR] No callback registered vor on_connected!');
      }
    })
    .catch(function(err){
      console.error('[ERROR] Error creating Influx database: %j', err);
    });

    global_settings = settings;
};
