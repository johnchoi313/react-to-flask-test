#!/bin/bash

x-terminal-emulator -e "pwd && 
			cd /home/er/Desktop/react-to-flask-test/ &&
			pwd && 
			python3.8 -m pipenv run python routes.py"
