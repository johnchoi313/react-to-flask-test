from flask import Flask, jsonify
from flask_cors import CORS, cross_origin

from flask import render_template
from flask import request
from pymycobot.mycobot import MyCobot

import json
import time



from flask import Flask, redirect, url_for, request
app = Flask(__name__)
CORS(app)

@app.route('/click', methods=['GET'])
@cross_origin()
def click():
#    return "You clicked the button"

   # mc = MyCobot('/dev/ttyAMA0',1000000)
   # mc.set_color(0,255,0)
   return jsonify({'response': 'you clicked the button'})

@app.route('/demo-move', methods=['POST'])
@cross_origin()
def demo_move():
   if request.method == 'POST':
      print("received api request")
      angles = request.args.get('angles')
      angles_list = [float(i) for i in angles.split(",")]
      sp = 80
      print(angles)
      mc = MyCobot('/dev/ttyAMA0',1000000)
      mc.send_angles(angles_list, sp)
      return jsonify({'response': str(angles)})

@app.route('/send-angles-sequence', methods=['POST'])
@cross_origin()
def send_angles_sequence():
   if request.method == 'POST':
      print("received api request")
      angles_sequence = request.args.get('angles_sequence')
      sequence_json = json.loads(angles_sequence)
      angles_1 = sequence_json['commandsArm1']
      angles_2 = sequence_json['commandsArm2']
      angles_3 = sequence_json['commandsArm3']
      angles_4 = sequence_json['commandsArm4']
      angles_5 = sequence_json['commandsArm5']
      angles_6 = sequence_json['commandsArm6']
      sp = 80
      mc = MyCobot('/dev/ttyAMA0',1000000)
      for angle_1, angle_2, angle_3, angle_4, angle_5, angle_6 in zip(angles_1, angles_2, angles_3, angles_4, angles_5, angles_6):
         angles_list = [angle_1, angle_2, angle_3, angle_4, angle_5, angle_6]
         print(f"Sending angles: {angles_list}")
         mc.send_angles(angles_list, sp)
         time.sleep(1)
      print("Done sending angles")
      return jsonify({'response': str(angles_sequence)})


# @app.route('/login',methods = ['POST', 'GET'])
# def login():
#    if request.method == 'POST':
#       user = request.form['name']
#       return redirect(url_for('dashboard',name = user))
#    else:
#       user = request.args.get('name')
#       return render_template('login.html')

if __name__ == '__main__':
   # app.run(debug = True, host='0.0.0.0')
   app.run(host='0.0.0.0', port=5000)