#!/usr/bin/python

import argparse
import softlayer_messaging
import datetime
from influxdb import InfluxDBClient


parser = argparse.ArgumentParser(description='receive data from softlayer queue')
parser.add_argument('influx_internal_ip', help='ex: 10.122.73.78')
parser.add_argument('queue_name', help='queue name')
parser.add_argument('pop_count', help='ex: 100')
args = parser.parse_args()

host		=	args.influx_internal_ip
port		=	8086
user		=	'cricket'
password	=	'cricket'
dbname		=	'cricket_data'
client_influxdb = InfluxDBClient(host, port, user, password, dbname)

client_softlayer = softlayer_messaging.get_client('5zdc3')
client_softlayer.authenticate('SL1187241', '876a3a7bb1114096ce6a48ab6b246d23e3c9b6717dd115b37063680f92acdd04')

# all messages are visible in the queue after 10 seconds and expire after 600 seconds
# client.create_queue(name='cricket_queue_001', visibility_interval=10, expiration=600)
queue = client_softlayer.queue(args.queue_name)

queue_message = queue.pop(count=int(args.pop_count))

if queue_message['item_count'] > 0:

  for i in range(0, queue_message['item_count']):

    device	=	queue_message['items'][i]['body'].split(',')[0]
    region	=	queue_message['items'][i]['body'].split(',')[1]
    time	=	queue_message['items'][i]['body'].split(',')[2]

    for key in queue_message['items'][i]['fields']:

      measurement	= key
      value		= queue_message['items'][i]['fields'][key]

      json_body = [{"measurement" : measurement,
                    "tags"        : {
                                     "device" : device,
                                     "region" : region
                                    },
                   "time"         : time,
                   "fields"       : {
                                     "value" : str(float(value))
                                    }
                  }]

      print json_body
      client_influxdb.write_points(json_body)

    queue.message(queue_message['items'][i]['id']).delete()

else:

  print 'No Messages'+','+datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
