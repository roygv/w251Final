import pandas as pd
from sqlalchemy import create_engine
from influxdb import InfluxDBClient
import time


def connectSQL():
    connection_str = 'mssql+pyodbc://royg:Welcome1@SCADA'
    engine = create_engine(connection_str)
    conn = engine.connect()
    return conn

def getData(conn,interval):
    if (interval==1):
        tabname='data_values_min_4_2017'
    else:
        tabname='data_values_'+str(interval)+'min_4_2017'
    queryResult = conn.execute('''
--        SELECT TOP 10 RTRIM(LTRIM(REPLACE(REPLACE(dd.name,' ','\ '),',','\,'))) measurement,
        SELECT LTRIM(dd.name) measurement,
            CAST(dd.osi_key AS VARCHAR) AS [key],
            CAST(dd.station_id AS VARCHAR) site,
            SUBSTRING(dd.[name],1,1) array,
            dt.description data_type,
            '''+str(interval)+''' interval,
            CAST(VALUE AS VARCHAR(30)) value,
            CONVERT(VARCHAR(19),d.u_time,126)+'Z' timestamp
          FROM [dbo].'''+tabname+''' d WITH(NOLOCK)
          JOIN tempdb..dd1 dd
           ON dd.osi_key = d.osi_key
         JOIN dbo.stations s
           ON s.station_id = dd.station_id
         JOIN dbo.data_types dt
           ON dt.data_type = d.data_type
--         WHERE u_time BETWEEN '2017-04-19 00:00:00' and '2017-04-19 01:00:00'
         WHERE u_time > DATEADD(mi,-3,CURRENT_TIMESTAMP)
    ''')
    pNodeIDsDF = pd.DataFrame(queryResult.fetchall())
    if pNodeIDsDF.empty == False:
        pNodeIDsDF.columns = queryResult.keys()
    return pNodeIDsDF

c=connectSQL()
host = '50.23.122.133'
port = 8086
user = 'roy'
password = 'Kaftor'
dbname = 'w209'
client = InfluxDBClient(host, port, user, password, dbname)
rc=0
while(True):
    for interval in (15,5,1):
        df = getData(c, interval)
        for node in df.itertuples():
            # print(node[8])
            json_body = [
                {
                    "measurement": node[1],
                    "tags": {
                        "key": node[2],
                        "site": node[3],
                        "array": node[4],
                        "data_type": node[5],
                        "interval": node[6]
                    },
                    "time": node[8],
                    "fields": {
                        "value": float(node[7])  # str(float(node[7]))
                    }
                }
            ]
            rc = client.write_points(json_body, time_precision='s')
            print('1 row written for interval {0}'.format(interval))
            if (rc == 0):
                print("reconnecting...")
                c = connectSQL()
                client = InfluxDBClient(host, port, user, password, dbname)
        if (rc == 1):
             print('{0} rows written for interval {1}'.format(df.shape[0],interval))
    time.sleep(60)
