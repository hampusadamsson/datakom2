#! /usr/bin/python

import sys,socket,struct,select

BLOCK_SIZE= 512

OPCODE_RRQ=   1
OPCODE_WRQ=   2
OPCODE_DATA=  3
OPCODE_ACK=   4
OPCODE_ERR=   5

MODE_NETASCII= "netascii"
MODE_OCTET=    "octet"
MODE_MAIL=     "mail"


#TFTP_PORT= 69
#TFTP_PORT= 13069
TFTP_PORT= 6969
#TFTP_PORT= 20069


# Timeout in seconds
TFTP_TIMEOUT= 2

ERROR_CODES = ["Undef",
               "File not found",
               "Access violation",
               "Disk full or allocation exceeded",
               "Illegal TFTP operation",
               "Unknown transfer ID",
               "File already exists",
               "No such user"]

# Internal defines
TFTP_GET = 1
TFTP_PUT = 2

def make_packet_rrq(filename, mode):
    # Note the exclamation mark in the format string to pack(). What is it for?
    # The exclamation mark is used to indicate the byte order, size and alignment. 
    return struct.pack("!H", OPCODE_RRQ) + filename + '\0' + mode + '\0'

def make_packet_wrq(filename, mode):
    return struct.pack("!H", OPCODE_WRQ) + filename + '\0' + mode + '\0'

def make_packet_data(blocknr, data):
    return struct.pack("!HH", OPCODE_DATA, blocknr) + data

def make_packet_ack(blocknr): 
    return struct.pack("!HH", OPCODE_ACK, blocknr)

def make_packet_err(errcode, errmsg):
    return struct.pack("!HH", OPCODE_ERROR, errcode) + errmsg + '\0'

def parse_packet(msg):
    """This function parses a recieved packet and returns a tuple where the
    first value is the opcode as an integer and the following values are
    the other parameters of the packets in python data types"""
    opcode = struct.unpack("!H", msg[:2])[0]
    if opcode == OPCODE_RRQ:
        l = msg[2:].split('\0')
        if len(l) != 3:
            return None
        return opcode, l[1], l[2]
    elif opcode == OPCODE_WRQ:
        l = msg[2:].split('\0')
        if len(l) != 3:
            return None
        return opcode, l[1], l[2]
    elif opcode == OPCODE_DATA:
        blocknr = struct.unpack("!H", msg[2:4])[0]
        temp = msg[2:]
        data = temp[2:]
        return opcode, blocknr, data
    elif opcode == OPCODE_ACK:
        blocknr = struct.unpack("!H", msg[2:4])[0]
        return opcode, blocknr
    elif opcode == OPCODE_ERR:
        errcode = struct.unpack("!H", msg[2:4])[0]
        temp = msg[2:]
        errmsg = temp[2:]
        errmsg = errmsg[:-2]
        return opcode, errcode, errmsg
    return None

def tftp_transfer(fd, hostname, direction):
    # Set up socket
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sockaddr = (socket.gethostbyname(hostname), TFTP_PORT)
    s.settimeout(TFTP_TIMEOUT)

    # Check if we are putting a file or getting a file and send
    #  the corresponding request.

    if direction == TFTP_GET:
        s.sendto(make_packet_rrq(fd.name, MODE_OCTET), sockaddr) 
        
    elif direction == TFTP_PUT:
        s.sendto(make_packet_wrq(fd.name, MODE_OCTET), sockaddr) 
    
    # Set a package variable that will increment for each packet sent/received
    next_block = 1

    # Put or get the file, block by block, in a loop.
    while True:
        (rl,wl,xl)=select.select([s],[],[],TFTP_TIMEOUT)
        if s in rl:
            (raw_data, sockaddr) = s.recvfrom(BLOCK_SIZE + 4)
            parsed = parse_packet(raw_data)

            # Get file block by block.
            if parsed[0] == OPCODE_DATA and direction == TFTP_GET:
                (opcode, block, data) = parsed
                if block==next_block:
                    ack = make_packet_ack(block)
                    s.sendto(ack, sockaddr) 
                    fd.write(data)
                    next_block+=1
                    #---------------------------------------------#
                    # Denna rad är värdet ändrat från 500 till 516
                    #---------------------------------------------#
                    if len(raw_data)<516:
                        break 
            
            # Check if we receive an error.
            elif parsed[0] == OPCODE_ERR:
                (opcode, errcode, errmsg) = parsed
                print errcode, errmsg
                break

            # Put a file block by block.
            elif parsed[0] == OPCODE_ACK and direction == TFTP_PUT:
                (opcode, block) = parsed
                if block==next_block-1:
                    data = fd.read(BLOCK_SIZE)
                    if not data:
                        #-----------------------------------------------------------------------------------------------#
                        # På denna rad har jag ändrat så om vi är vid slutet så ska vi fortfarande skicka ett tomt paket. Kommer dock behöva lägga till en retry limit här: typ 20 eller nåt
                        #-----------------------------------------------------------------------------------------------#
                        packet = make_packet_data(next_block, data)
                        s.sendto(packet, sockaddr)
                    else:
                        packet = make_packet_data(next_block, data)
                        s.sendto(packet, sockaddr) 
                        next_block+=1
#                else:
#                    print "wrong block"
#                    packet = make_packet_data(next_block, data)
#                    s.sendto(packet, sockaddr)
        
        # If we get a timeout.
        else:
            # The direction is get. Make a new request for the packet. If it is the first packet
            # then send a new request. If not make and send a new ack for the packet.
            if direction == TFTP_GET:
                if next_block==1:
                    s.sendto(make_packet_rrq(fd.name, MODE_OCTET), sockaddr) 
                else:
                    ack = make_packet_ack(next_block-1)
                    s.sendto(ack, sockaddr)           
            # If the direction is put. Send the packet again.
            elif direction == TFTP_PUT:
                if next_block==1:
                    s.sendto(make_packet_wrq(fd.name, MODE_OCTET), sockaddr)
                else:
                    s.sendto(packet, sockaddr) 
            elif direction == TFTP_PUT:                
                s.sendto(packet, sockaddr) 
    pass

def usage():
    """Print the usage on stderr and quit with error code"""
    sys.stderr.write("Usage: %s [-g|-p] FILE HOST\n" % sys.argv[0])
    sys.exit(1)

def main():
    # No need to change this function
    direction = TFTP_GET
    if len(sys.argv) == 3:
        filename = sys.argv[1]
        hostname = sys.argv[2]
    elif len(sys.argv) == 4:
        if sys.argv[1] == "-g":
            direction = TFTP_GET
        elif sys.argv[1] == "-p":
            direction = TFTP_PUT
        else:
            usage()
            return
        filename = sys.argv[2]
        hostname = sys.argv[3]
    else:
        usage()
        return

    if direction == TFTP_GET:
        print "Transfer file %s from host %s" % (filename, hostname)
    else:
        print "Transfer file %s to host %s" % (filename, hostname)

    try:
        if direction == TFTP_GET:
            fd = open(filename, "wb")
        else:
            fd = open(filename, "rb")
    except IOError as e:
        sys.stderr.write("File error (%s): %s\n" % (filename, e.strerror))
        sys.exit(2)

    tftp_transfer(fd, hostname, direction)
    fd.close()

if __name__ == "__main__":
    main()
