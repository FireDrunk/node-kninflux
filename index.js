//Strict mode
"use strict";

//Debug mode
const DEBUG = true;

//System includes
var util = require('util');
var fs = require('fs');

//Custom includes
var knx = require('./includes/knx/knx');
var influx = require('./includes/influx/influx');

// Settings
try {
  var settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
  if (DEBUG) console.log("[DEBUG] Settings: %j", settings);
}
catch (err) {
  if (DEBUG) console.error("[ERROR] Error parsing settings.json!");
}


// Environment
var environment = JSON.parse(fs.readFileSync('environment.json', 'utf8'));
if (DEBUG) console.log("[DEBUG] Environment: %j", environment);

// Events
function on_knx_data_point_received(name, address, value) {
  if (DEBUG) console.log("[DEBUG] KNX Data point received, (%j, %j, %j)", name, address, value);
  influx.write
}

// Callbacks
function on_knx_connected() {
  if (DEBUG) console.log("[DEBUG] Connected to KNX");

  // Push the environment to the KNX module
  knx.register_environment(environment);
  if (DEBUG) console.log("[DEBUG] Registered Environment");

  // Start the read loop
  knx.start_reading(1000);
  if (DEBUG) console.log("[DEBUG] Started reading loop");
}

//Register Callbacks
knx.register_callback("on_data_point_received", on_knx_data_point_received)
knx.register_callback("on_connected", on_knx_connected);

influx.register_callback("on_connected", function(){
  if (DEBUG) console.log("[DEBUG] Connected to Influx");
  // Connect to KNX
  knx.connect();
});

// Connect to Influx
influx.connect(settings);
