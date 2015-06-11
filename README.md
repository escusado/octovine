# octovine

A simple client-server remote timelapses.

## How

A client that runs on an octopi instance, that watches for files on a folder
(wating for touch) and requests the event to a remote server.

A remote server that gets a remote image on command, timestamp it and saves it.