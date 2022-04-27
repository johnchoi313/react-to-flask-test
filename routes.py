from flask import Flask, jsonify
from flask_cors import CORS, cross_origin

from flask import render_template
from flask import request
from pymycobot.mycobot import MyCobot



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
      angles_list = [float(i) for i in angles.split("-")]
      sp = 80
      print(angles)
      mc = MyCobot('/dev/ttyAMA0',1000000)
      mc.send_angles(angles_list, sp)
      return jsonify({'response': str(angles)})


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