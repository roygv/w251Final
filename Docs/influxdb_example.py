#!/usr/bin/python

import json
from influxdb import InfluxDBClient

client_influxdb = InfluxDBClient('50.23.117.76', '8086', 'cricket', 'cricket', 'cricket_data')

query = 'SELECT "data_center", "device", "value" FROM "cricket_data"."cricket_retention"."measurement001" WHERE time > now() - 1m order by time'
result = client_influxdb.query(query)

for r in result:
  i = 0
  for data_center, device, value, time in r:
    print "measurement001",'\t',r[i][data_center],'\t',r[i][device],'\t',r[i][time],'\t',r[i][value]
    i += 1
