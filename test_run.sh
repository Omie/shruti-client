#!/bin/bash

export SHRUTI_CLIENT_HOST=0.0.0.0
export SHRUTI_CLIENT_PORT=9576
export SHRUTI_CLIENT_ID=webclient1234567
export SHRUTI_CLIENT_REFRESH_INTERVAL=1
export SHRUTI_API_URL=http://127.0.0.1:9574/
export SHRUTI_IVONA_URL=http://127.0.0.1:9575/

export SHRUTI_PUSHER_API_KEY=
export SHRUTI_PUSHER_CHANNEL=shrutitest
export SHRUTI_PUSHER_EVENT=new-notification

rm shruti-client
go build
./shruti-client


