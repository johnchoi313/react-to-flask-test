import requests
from requests import get

ip = get('https://api.ipify.org').content.decode('utf8')

print(ip)