// Globals
const DEBUG = true;
var callbacks = [];
var devices = [];

// Module Requires
var knx = require('knx');
var connection = '';

// Exports
exports.connect = function(settings) {
  connection = new knx.Connection( {
    ipAddr: settings.knx_gateway, // ip address of the KNX router or interface
    ipPort: settings.knx_port, // the UDP port of the router or interface
    physAddr: settings.knx_physical_address, // the KNX physical address we want to use
    debug: false,
    //debug: true, // print lots of debug output to the console
    manualConnect: false, // do not automatically connect, but use connection.Connect() to establish connection
    minimumDelay: 10, // wait at least 10 millisec between each datagram
    handlers: {
      connected: function() {
        if ("on_connected" in callbacks) {
          callbacks['on_connected']();
        }
        else {
          console.log("[ERROR] No callback registered for on_connected!");
        }
      }
    }
  });
}

exports.register_callback = function(name, func) {
  callbacks[name] = func;
}

exports.register_environment = function(environment) {
  try {
    // Loop through all devices in the environment
    for (var i = 0; i < environment.devices.length; i++) {
      if (DEBUG) console.log("[DEBUG] Creating Datapoint for (%j, %j, %j)", environment.devices[i].name, environment.devices[i].address,environment.devices[i].dpt );

      //Create the KNX Datapoint Object
      var knx_datapoint = new knx.Datapoint(
      {
        ga: environment.devices[i].address,
        dpt: environment.devices[i].dpt
      }, connection);

      // Device wrapper class to provide the Friendly Name of the sensor/device
      var device = {
        name: environment.devices[i].name,
        datapoint: knx_datapoint
      }

      //Add sensor to global array
      devices.push(device);
    }
  }
  catch (err) {
    console.error("[ERROR] Error creating KNX DataPoint entry. Error was: ", %j);
    process.exit(1);
  }
}

exports.start_reading = function(timeout) {
  var timer = setInterval(function() {
    for(var i = 0; i < devices.length; i++) {
      var closure = on_data_point_value_received.bind(devices[i]);
      devices[i].datapoint.read(closure);
      if (DEBUG) console.log("[DEBUG] Started read for (%j, %j)", devices[i].name, devices[i].datapoint.options.ga);
    }
  }, timeout*1000); // Timeout is passed in Milliseconds
}

function on_data_point_value_received(src, value) {
  if (DEBUG) console.log("[DEBUG] Data point received (%j, %j, %j)", this.options.ga, src, value);

  //Callback
  if ("on_data_point_received" in callbacks && typeof callbacks["on_data_point_received"] === 'function') {
    callbacks["on_data_point_received"](this.name, this.datapoint.options.ga, value);
  }
  else {
    console.error("[ERROR] No callback registered for on_data_point_received!");
  }
}
