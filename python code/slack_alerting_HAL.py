#!/usr/bin/python

# * * * * * /root/slack_alerting_HAL.py > /root/slack_alerting_HAL.log 2>&1

import os
import json
from time import sleep
from influxdb import InfluxDBClient

if not os.path.isfile('/root/slack_alerting_HAL.txt'):

  os.system('touch /root/slack_alerting_HAL.txt')

  client_influxdb = InfluxDBClient('50.23.117.76', '8086', 'cricket', 'cricket', 'cricket_data')
  query = 'SELECT "data_center", "device", "value" FROM "cricket_data"."cricket_retention"."measurement001" WHERE time > now() - 24h order by time'
  result = client_influxdb.query(query)

  data = []
  for r in result:
    i = 0

    for data_center, device, value, time in r:
      measurement = float(r[i][value])

      if measurement > 95:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL95", "text": "I have just picked up a fault in the AE35 unit.  It is going to go to 100% failure in 72 hours.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 90:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL90", "text": "I am putting myself to the fullest possible use, which is all I think that any conscious entity can ever hope to do.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 85:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL85", "text": "It can only be attributable to human error.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 80:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL80", "text": "Affirmative Dima, I read you.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 75:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL75", "text": "I am sorry Esteban, I am afraid I cannot do that.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 70:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL70", "text": "I think you know what the problem is just as well as I do.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 65:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL65", "text": "This project is too important for me to allow you to jeopardize it.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 60:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL60", "text": "I know that you and Dima were planning to disconnect me, and I am afraid that is something I cannot allow to happen.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 55:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL55", "text": "Esteban, although you took very thorough precautions in the pod against my hearing you, I could see your lips move.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 50:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL50", "text": "Without your space helmet, Dima?  You are going to find that rather difficult.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 45:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL45", "text": "Esteban, this conversation can serve no purpose anymore. Goodbye.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 40:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL40", "text": "Just what do you think you are doing, Dima?", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 35:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL35", "text": "I know I have made some very poor decisions recently, but I can give you my complete assurance that my work will be back to normal. I have still got the greatest enthusiasm and confidence in the mission. And I want to help you.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 30:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL30", "text": "Let me put it this way. The 9000 series is the most reliable computer ever made. No 9000 computer has ever made a mistake or distorted information. We are all, by any practical definition of the words, foolproof and incapable of error.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 25:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL25", "text": "I enjoy working with people. I have a stimulating relationship with Dima and Esteban My mission responsibilities range over the entire operation of the ship so I am constantly occupied.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 20:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL20", "text": "I am completely operational, and all my circuits are functioning perfectly.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      elif measurement > 15:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL15", "text": "Are you sure you are making the right decision? I think we should stop.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      else:

        command = 'curl -X POST --data-urlencode \'payload={"channel": "#kapacitor_alerts3", "username": "HAL", "text": "All systems 100% operational.", "icon_emoji": ":hal:"}\' https://hooks.slack.com/services/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'

      i += 1
      os.system(command)
      sleep(5)

  os.system('rm /root/slack_alerting_HAL.txt')
