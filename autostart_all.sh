#!/bin/sh

echo "waiting 5 seconds to warm up..."
sleep 1
echo "waiting 4 seconds to warm up..."
sleep 1
echo "waiting 3 seconds to warm up..."
sleep 1
echo "waiting 2 seconds to warm up..."
sleep 1
echo "waiting 1 seconds to warm up..."
sleep 1

echo "starting node."
sudo sh /home/ubuntu/Desktop/react-to-flask-test/autostart_npm.sh

echo  "starting python."
sudo sh /home/ubuntu/Desktop/react-to-flask-test/autostart_python.sh

