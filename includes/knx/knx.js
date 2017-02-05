// Globals
var callbacks = [];
var datapoints = [];

// Module Requires
var knx = require('knx');

// Initial Connection
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
        //callbacks['on_connected']();
      }
      else {
        console.log("No callback registered for on_connected!");
      }
    }
  }
});

function init_datapoints(environment) {
  for (var i = 0; i < environment.devices.length; i++) {
    var device = new knx.Datapoint({ga: environment.devices[i].address, dpt: environment.devices[i].dpt});
    device.bind(connection);
    datapoints.push(device);
  }
}

function read_all_datapoints() {
  for (var i = 0; i < datapoints.length; i++) {
    datapoints[i].read( (src, value) =>{
      if ("on_data_point_error" in callbacks) {
        callbacks["on_data_point_received"]("test_name", src, value);
      }
      else {
        console.log("No callback registered for on_data_point_received!");
      }
    });
  }
}

// Exports
exports.connect = function() {
  connection.Connect();
}

exports.register_callback = function(name, func) {
  callbacks[name] = func;
}

exports.start_reading = function(timeout, environment) {
    init_datapoints(environment);
    var timer = setInterval(function() {
      read_all_datapoints();
    }, timeout);
}
