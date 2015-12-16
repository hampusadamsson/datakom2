from  sys import argv

# Echo client program
import socket

print  argv[1]

#HOST = 'daring.cwi.nl'    # The remote host
HOST = 'joshua.it.uu.se'
HOST = socket.gethostbyname(HOST)
PORT = 6969

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect((HOST, PORT))
#s.sendall('WRQ')
s.sendall('!H1small.txt010')


data = s.recv(1024)
s.close()
print 'Received', repr(data)
