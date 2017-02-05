// Create a multicast connection, no mandatory arguments.
var knx = require('knx');
var util = require('util');
var fs = require('fs');
var environment = JSON.parse(fs.readFileSync('environment.json', 'utf8'));
var datapoints = [];

console.log("Environment: %j", environment);

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
      console.log('Connected');
      init();
      on_connected();
    },
    event: function(evt, src, dest, value) { 
      //console.log("event: %s, src: %j, dest: %j, value: %j", evt, src, dest, value);
    },
    // get notified on connection errors
    error: function(connstatus) {
      console.log("**** ERROR: %j", connstatus);
    }
  }
});

var datapoints = [];

function init() {
  for (var i = 0; i < environment.devices.length; i++) {
    var device = new knx.Datapoint({ga: environment.devices[i].address, dpt: environment.devices[i].dpt});
    device.bind(connection);
    datapoints.push(device);

    // Request initial value
    device.read( function(response) {
      console.log("Got back initial value: %j", response);
    });
  }
}

function on_connected() {
  var timer = setInterval(function() {
    read_all_datapoints();
  }, 1000);
  console.log(timer);
}

function read_all_datapoints() {
  for (var i = 0; i < datapoints.length; i++) {
    datapoints[i].read( (src, value) =>{
      console.log("knx_value,address=%j value=%j", src, value);
    });
  }
}


// Influx
var influx_db_host = '';
var influx_db_name = 'knx_db';

const influx = new Influx.InfluxDB({
	host: influx_db_host,
	database: influx_db_name,
	schema: [
	  {
		measurement: 'knx_values',
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
      console.log('Creating database: %j', influx_db_name);
      return influx.createDatabase(influx_db_name);
    }
  })
  .catch(err => {
    console.error(`Error creating Influx database!`);
  });

connection.Connect();
