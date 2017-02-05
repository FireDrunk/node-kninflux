// Globals
var callbacks = [];
var datapoints = [];

// Module Requires
var knx = require('knx');

// Setup Connection
var connection = new knx.Connection( {
  ipAddr: '192.168.4.122', // ip address of the KNX router or interface
  ipPort: 3671, // the UDP port of the router or interface
  physAddr: '15.15.15', // the KNX physical address we want to use
  debug: false,
  //debug: true, // print lots of debug output to the console
  manualConnect: true, // do not automatically connect, but use connection.Connect() to establish connection
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

// Exports
exports.connect = function() {
  connection.Connect();
}

exports.register_callback = function(name, func) {
  callbacks[name] = func;
}

exports.register_environment = function(environment) {
  for (var i = 0; i < environment.devices.length; i++) {
    var device = new knx.Datapoint({ga: environment.devices[i].address, dpt: environment.devices[i].dpt});
    device.bind(connection);
    datapoints.push(device);
  }
}

exports.start_reading = function(timeout) {
    var timer = setInterval(function() {
      for (var i = 0; i < datapoints.length; i++) {
        datapoints[i].read( (src, value) =>{
          if ("on_data_point_error" in callbacks) {
            callbacks["on_data_point_received"]("test_name", src, value);
          }
          else {
            console.log("[ERROR] No callback registered for on_data_point_received!");
          }
        });
      }
    }, timeout);
}
