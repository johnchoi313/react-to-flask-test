#!/bin/sh

echo "waiting 10 seconds to warm up..."
sleep 10

echo "starting node."
sudo sh /home/ubuntu/Desktop/react-to-flask-test-main/autostart_npm.sh

echo  "starting python."
sudo sh /home/ubuntu/Desktop/react-to-flask-test-main/autostart_python.sh

