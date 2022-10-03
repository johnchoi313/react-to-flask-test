#!/bin/bash

x-terminal-emulator -e "pwd && 
			cd /home/ubuntu/Desktop/react-to-flask-test-main/ &&
			pwd && 
			python3.8 -m pipenv run python routes.py"
