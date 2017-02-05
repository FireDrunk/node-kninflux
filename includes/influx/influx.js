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
