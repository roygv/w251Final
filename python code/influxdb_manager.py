#!/usr/bin/python

import os

for i in range(1, 101):
  python_worker = "/root/influxdb_worker.py measurement" + "%03d" % i
  print python_worker
  os.system(python_worker)
