node-kninflux
======

#### Description:
A fairly simple application to write your KNX Sensor data to Influx

### Database:
This application autocreates an influxdb when it cannot find one.
__PLEASE BE AWARE, IF YOU ARE USING AN EXISTING DATABSE. IT WILL NOT ASK FOR ANY CONFIRMATION!__

Table is designed as:
*knx_address*, *knx_value*. Timestamp is automatically added by influxdb, and the record is *tagged* with the sensor name set in environment.json. You can easily filter by-tag in Influx's Query Language.

#### Basic Usage:
Download a release zip and extract it somewhere (or clone the repository).
copy example.settings.json to settings.json and change all settings accordingly.
copy example.environment.json to environment.json and replace the test data with your own sensors.

To run the application, execute:
```bash
node index.js
```
#### Extra (for graphical view):
Docker is recommended for ease of use, altough other methods of installing Influx/Grafana are fine.

- Install docker (https://docs.docker.com/engine/installation/linux/)
- Install Influx:
```bash
mkdir influxdata
docker run -d -p 8083:8083 -p 8086:8086 -v $PWD/influxdata:/var/lib/influxdb influxdb
```
- Install Grafana
```bash
docker run -d -p 3000:3000 grafana/grafana
```
Navigate to [ip]:3000/, login (default is admin/secret), setup datasource to: http://[ip]:8086, choose proxy method, set database to knx_db (or the value you have set in settings.json).

Add a graph, query is something like:
- FROM knx_values
- WHERE [fill in yourself]
- GROUP BY time($interval), field(knx_address), tag(name), fill(null)
- ALIAS BY "$tag_name", Format as "Time Series"

(Most of the above data is default).
