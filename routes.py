from flask import Flask, jsonify
from flask_cors import CORS

from flask import render_template
from flask import request
from pymycobot.mycobot import MyCobot



from flask import Flask, redirect, url_for, request
app = Flask(__name__)
CORS(app)

@app.route('/click')
def click():
#    return "You clicked the button"

   mc = MyCobot('/dev/ttyAMA0',1000000)
   mc.set_color(0,255,0)
   return jsonify({'response': 'you clicked the button'})

# @app.route('/login',methods = ['POST', 'GET'])
# def login():
#    if request.method == 'POST':
#       user = request.form['name']
#       return redirect(url_for('dashboard',name = user))
#    else:
#       user = request.args.get('name')
#       return render_template('login.html')

if __name__ == '__main__':
   app.run(debug = True)