#!/usr/bin/python

import json
import argparse
from influxdb import InfluxDBClient

parser = argparse.ArgumentParser(description = 'pull data for softlayer queue'	)
parser.add_argument(	'measurement'	,	help = 'measurement001'		)
args = parser.parse_args()

client_influxdb = InfluxDBClient('50.23.117.76', '8086', 'cricket', 'cricket', 'cricket_data')

query = 'SELECT "data_center", "device", "value" FROM "cricket_data"."cricket_retention".'+args.measurement+' WHERE time > now() - 10m order by time'
result = client_influxdb.query(query)

for r in result:
  i = 0
  for data_center, device, value, time in r:
    print args.measurement,'\t',r[i][data_center],'\t',r[i][device],'\t',r[i][time],'\t',r[i][value]
    i += 1
