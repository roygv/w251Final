#!/usr/bin/python

import random
from time import sleep
import datetime

number_of_measurements	= 100
number_of_measures	= 10

f = open('/root/roy_data.txt', 'w')

# insert a sleep to prevent collisions with cricket_message_generator.py which also runs every minute
# cron's most granular setting is every minute (not every one minute 30 seconds)
sleep(15)

for i in range(1,number_of_measurements+1):
  for j in range(1,number_of_measures+1):
    f.write('measurement'+"%03d" % i+','+str(random.uniform(0, 100))+'\n')
f.close()

print datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
