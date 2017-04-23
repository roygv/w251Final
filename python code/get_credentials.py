import subprocess 

filename = "cricket.txt"
print('host', 'IP', 'root_pwd')
lines = [line.rstrip('\n') for line in open(filename)]
for line in lines:
    a = line.split()
    # output = call(["slcli", "vs", "credentials", a[0]])
    result = subprocess.run(["slcli", "vs", "credentials", a[0]], stdout=subprocess.PIPE)
    res = result.stdout.decode('utf-8').split()
    print(a[1], a[2], str(res[1]))

