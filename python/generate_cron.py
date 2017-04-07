filename = "cricket.txt"
print('host', 'IP', 'root_pwd')
lines = [line.rstrip('\n') for line in open(filename)]

for line in lines:
    a = line.split()
    cron_file = a[1] + "_cron"
    cfile = open(cron_file, 'w')
    #arr = a[1].split('et')
    for i in range(1,51):
        cricket = a[1] + "_" + str(i) 
        cfile.write("* * * * * root /root/cricket_message_generator.py 50.23.117.76 " +  cricket + " " +  a[4] + " " + cricket + ".txt > /root/" + cricket + "_message_generator.log 2>&1")
#    cfile.write("; /root/roy_generator.py > /root/roy_generator.log 2>&1) ")
        cfile.write("\n")
    cfile.close()

    print("scp ", cron_file, "root@" + a[2] + ":/etc/cron.d/")
