#!/usr/bin/python

import random
import os
import argparse
import datetime
from influxdb import InfluxDBClient

# * * * * * /root/cricket_message_generator.py 50.23.117.76 cricket_001_01 sjc01 /root/cricket_001_01_data.txt >> /root/cricket_001_01_message_generator.log 2>&1
parser = argparse.ArgumentParser(description = 'generate data for softlayer queue'		)
parser.add_argument(    'influx_external_ip'    , help = 'ex: 169.53.133.132'			)
parser.add_argument(	'device_name'		, help = 'cricket_001_01'			)
parser.add_argument(	'data_center'		, help = 'ex: sjc01'				)
parser.add_argument(	'file_name'		, help = 'ex: /root/cricket_001_01_data.txt'	)
args = parser.parse_args()

# IF FILE ALREADY EXISTS - DO NOT RUN! - CRICKET GENERATOR IS ALREADY RUNNING FOR THAT DEVICE #################

if not os.path.isfile(args.file_name):

# GENERATE DATA ###############################################################################################

  number_of_measurements  = 100
  number_of_measures      =  10

  f = open(args.file_name, 'w')

  for i in range( 1 , number_of_measurements + 1 ):

    for j in range( 1 , number_of_measures + 1 ):

      measurement	=	'measurement' + "%03d" % i
      value		=	str(random.uniform( 0 , 100 ))
      device		=	args.device_name + ',' + args.data_center + ',' + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

      f.write(device + ',' + measurement + ',' + value + '\n')

  f.close()

# POPULATE INFLUXDB DIRECTLY BECAUSE SOFTLAYER MESSAGING IS TOO SLOW ############################################

host            =       args.influx_external_ip
port            =       8086
user            =       'cricket'
password        =       'cricket'
dbname          =       'cricket_data'
client_influxdb = InfluxDBClient(host, port, user, password, dbname)

f = open(args.file_name, 'r')

for line in f:

  device	=	line.strip().split(',')[0]
  data_center	=	line.strip().split(',')[1]
  creation_time	=	line.strip().split(',')[2]
  measurement 	=	line.strip().split(',')[3]
  value		=	line.strip().split(',')[4]

  json_body = [{"measurement" : measurement,
                "tags"        : {
                                 "device"      : device,
                                 "data_center" : data_center
                                },
                "time"         : creation_time,
                "fields"       : {
                                  "value" : str(float(value))
                                 }
              }]

  print json_body
  client_influxdb.write_points(json_body)

f.close()
os.remove(args.file_name)
