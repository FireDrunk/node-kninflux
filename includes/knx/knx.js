// Globals
const DEBUG = true;
var callbacks = [];
var datapoints = [];

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
  for (var i = 0; i < environment.devices.length; i++) {
    if (DEBUG) console.log("[DEBUG] Creating Datapoint for (%j, %j, %j)", environment.devices[i].name, environment.devices[i].address,environment.devices[i].dpt );

    var knx_datapoint = new knx.Datapoint({ga: environment.devices[i].address, dpt: environment.devices[i].dpt}, connection);
    var datapoint = {
      name: environment.devices[i].name,
      address: envrionment.devices[i].address,
      datapoint: knx_datapoint
    }
    datapoints.push(datapoint);
  }
}

exports.start_reading = function(timeout) {
  var timer = setInterval(function() {
    for(var i = 0; i < datapoints.length; i++) {
      var datapoint = datapoints[i];
      datapoints[i].datapoint.read( (src,value, ga) => {
        if ("on_data_point_received" in callbacks) {
          for (var i = 0; i < datapoints.length; i++) {
            if (datapoints[i].address == ga) {
              callbacks["on_data_point_received"](datapoints[i].name, value, src);
            }
          }
          console.error("[ERROR] No registered sensor found for response!");
        }
        else {
          console.error("[ERROR] No callback registered for on_data_point_received!");
        }
      });
    }
  }, timeout*1000); // Timeout is passed in Milliseconds
}
