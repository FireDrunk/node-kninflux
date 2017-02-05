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
var global_settings = '';

// Settings
try {
  global_settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
  if (DEBUG) console.log("[DEBUG] Settings: %j", settings);
}
catch (err) {
  console.error("[ERROR] Error parsing settings.json!");
}

// Environment
var environment = JSON.parse(fs.readFileSync('environment.json', 'utf8'));
if (DEBUG) console.log("[DEBUG] Environment: %j", environment);

// Events
function on_knx_data_point_received(name, src, value) {
  if (DEBUG) console.log("[DEBUG] KNX Data point received, (%j, %j, %j)", name, src, value);

  //TODO: Rework promise return
  influx.write_data_point(name, src, value);
}

// Callbacks
function on_knx_connected() {
  if (DEBUG) console.log("[DEBUG] Connected to KNX");

  // Push the environment to the KNX module
  knx.register_environment(environment);
  if (DEBUG) console.log("[DEBUG] Registered Environment");

  // Start the read loop
  knx.start_reading(global_settings.interval);
  if (DEBUG) console.log("[DEBUG] Started reading loop");
}

//Register Callbacks
knx.register_callback("on_data_point_received", on_knx_data_point_received)
knx.register_callback("on_connected", on_knx_connected);

influx.register_callback("on_connected", function(){
  if (DEBUG) console.log("[DEBUG] Connected to Influx");

  // Connect to KNX
  knx.connect(global_settings);
});

// Connect to Influx
influx.connect(global_settings);
