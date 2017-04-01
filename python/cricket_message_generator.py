#!/usr/bin/python

import random
import os
import argparse
import softlayer_messaging
import datetime

parser = argparse.ArgumentParser(description = 'generate data for softlayer queue')
parser.add_argument(	'queue_name'	, help = 'queue name'		)
parser.add_argument(	'host_name'	, help = 'host name'		)
parser.add_argument(	'data_center'	, help = 'ex: sjc01'		)
parser.add_argument(	'file_name'	, help = 'ex: roy_data.txt'	)
args = parser.parse_args()

# IF roy_data.txt ALREADY EXISTS - DO NOT RUN! - CRICKET GENERATOR IS ALREADY RUNNING #################

if not os.path.isfile(args.file_name):

# GENERATE DATA ########################################################################################

  number_of_measurements  = 100
  number_of_measures      =  10

  f = open(args.file_name, 'w')

  for i in range(1,number_of_measurements+1):
    for j in range(1,number_of_measures+1):
      f.write('measurement'+"%03d" % i+','+str(random.uniform(0, 100))+'\n')

  f.close()

# PUSH DATA TO SOFTLAYER QUEUE #######################################################################

  client = softlayer_messaging.get_client('5zdff')
  client.authenticate('SL1187241', '876a3a7bb1114096ce6a48ab6b246d23e3c9b6717dd115b37063680f92acdd04')

  # all messages are visible in the queue after 10 seconds and expire after 600 seconds
  # client.create_queue(name='cricket_queue_001', visibility_interval=10, expiration=600)
  queue = client.queue(args.queue_name)

  f = open(args.file_name, 'r')

  for line in f:
    attribute	=	line.split(',')[0]
    value	=	line.split(',')[1]
    device	=	args.host_name +',' + args.data_center +','+datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    queue.push(device, fields={attribute : value}, visibility_delay=0)
    print (device+','+attribute+','+value).strip()

  f.close()
  os.remove(args.file_name)
