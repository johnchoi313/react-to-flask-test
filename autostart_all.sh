#!/bin/sh

echo "waiting 5 seconds to warm up..."
sleep 5

echo "starting node."
sudo sh /home/ubuntu/Desktop/react-to-flask-test/autostart_npm.sh

echo  "starting python."
sudo sh /home/ubuntu/Desktop/react-to-flask-test/autostart_python.sh

