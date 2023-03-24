#------------------------------------------#
#-----------LIRABRIES TO IMPORT------------#
#------------------------------------------#

from flask import Flask, jsonify
from flask_cors import CORS, cross_origin

from flask import render_template
from flask import request

import json
import time
import os

from os import listdir
from os.path import isfile, join

from pymycobot.mycobot import MyCobot

#------------------------------------------#
#-------------INIITALIZATION---------------#
#------------------------------------------#

# why was this duplicated?
from flask import Flask, redirect, url_for, request
app = Flask(__name__)
CORS(app)

mc = MyCobot(port = "/dev/ttyAMA0", baudrate = 1000000, debug = True)


#------------------------------------------#
#------MISCELLANEOUS HELPER FUNCTIONS------#
#------------------------------------------#




#------------------------------------------#
#-----------MYCOBOT CONTROL API------------#
#------------------------------------------#

'''
@app.route("/click", methods=["GET"])
@cross_origin()
def click():
    """
    DEPRECATED: This function was used to test the front and back end integrations (then why is it still here??)
    Returns: json: A 'success' string to be printed on the front end.
    """
    return jsonify({"response": "you clicked the button"})
'''

#[DESCRIPTION] This endpoint unlocks/turns off the motors so that drag and teach mode can be used. Allows moving the robot manually by hand.
#[OUTPUT]      json: A success or failure message.
@app.route("/turn-off-motors", methods=["POST"])
@cross_origin()
def turn_off_motors():
    if request.method == "POST":
        print("received api request")
        try:
            mc.set_color(255,255,255)
            mc.release_all_servos()
            return jsonify({"response": "TURNED OFF MOTORS"})
        except:
            return jsonify({"response": "FAILED TO TURN OFF MOTORS"})

#[DESCRIPTION] This endpoint is supposed to lock the motors and end the ability to move the robot manually by hand. Currently this is not working as expected.
#[OUTPUT]      json: A success or failure message.
@app.route("/turn-on-motors", methods=["POST"])
@cross_origin()
def turn_on_motors():  # NOTE THIS FUNCTION DOES NOT YET WORK
    if request.method == "POST":
        print("received api request")
        try:
            mc.set_color(0,255,0)
            mc.set_fresh_mode(0)
            return jsonify({"response": "TURNED ON MOTORS"})
        except Exception as e:
            print(e)
            return jsonify({"response": "FAILED TO TURN ON MOTORS"})

#[DESCRIPTION] This endpoint allows the front end to send a single string of angles also known as a pose. The robot will be given the command to immediately jump to that position.
#[OUTPUT]      json: A string of the list of angles that the robot moved to.
@app.route("/send-pose", methods=["POST"])
@cross_origin()
def send_pose():
    
    if request.method == "POST":
        print("received api request")
        angles = request.args.get("angles")
        angles_list = [float(i) for i in angles.split(",")]
        sp = 80
        print(angles)

        mc.set_color(0,255,0)
        mc.send_angles(angles_list, sp)
        return jsonify({"response": str(angles)})

#[DESCRIPTION] Pings the robot to get a list of angles of its current position and sends that data in a response.
#[OUTPUT] json: A list of the robot's current angles
@app.route("/get-pose", methods=["GET"])
@cross_origin()
def get_pose():
    if request.method == "GET":
        print("received api request")
        angles_list = mc.get_angles()
        return jsonify({"response": angles_list})


#[DESCRIPTION] Instructs the robot to move through a sequence of 20 angles while waiting 1 second in between each movement.
#[OUTPUT] json: A string of the full 20 step sequence of angles that the robot was instructed to move through.
@app.route("/send-angles-sequence", methods=["POST"])
@cross_origin()
def send_angles_sequence():

    if request.method == "POST":
        print("received api request")
        angles_sequence = request.args.get("angles_sequence")
        
        print(angles_sequence)
        sequence_json = json.loads(angles_sequence)
        angles_1 = sequence_json["commandsArm1"]
        angles_2 = sequence_json["commandsArm2"]
        angles_3 = sequence_json["commandsArm3"]
        angles_4 = sequence_json["commandsArm4"]
        angles_5 = sequence_json["commandsArm5"]
        angles_6 = sequence_json["commandsArm6"]
        sp = 80

        mc.set_color(0,0,255)

        for angle_1, angle_2, angle_3, angle_4, angle_5, angle_6 in zip(angles_1, angles_2, angles_3, angles_4, angles_5, angles_6):
            angles_list = [angle_1, angle_2, angle_3, angle_4, angle_5, angle_6]
            print(f"Sending angles: {angles_list}")
            mc.send_angles(angles_list, sp)
            time.sleep(1)

        mc.set_color(0,255,0)

        print("Done sending angles")
        return jsonify({"response": str(angles_sequence)})

#------------------------------------------#
#-----------SAVING/LOADING API-------------#
#------------------------------------------#

#[DESCRIPTION] Checks the directory where animation files are stored and returns a list of existing filenames in a response.
#[OUTPUT]      Returns: json: A list of filenames found in the directory where animation files are saved.
@app.route("/get-all-animation-files", methods=["GET"])
@cross_origin()
def get_all_animation_files():
    if request.method == "GET":
        animation_file_path = "./animation_files/"
        onlyfiles = [
            f
            for f in listdir(animation_file_path)
            if isfile(join(animation_file_path, f))
        ]
        return jsonify({"response": onlyfiles})




# [DESCRIPTION] Saves a provided sequence of angles as an animation file in the
#               animation_files directory as a .json file. If no filename is provided, one
#               will be automatically created. If a filename is provided, that filename
#               will be used to either create a new file (if one with that name doesn't
#               already exist), or overwrite the file with the existing name.
# [OUTPUT] json: A success or failure message.
@app.route("/save-as-animation-file", methods=["POST"])
@cross_origin()
def save_as_animation_file():
    
    if request.method == "POST":
        angles_sequence = request.args.get("angles_sequence")
        sequence_json = json.loads(angles_sequence)
        animation_file_path = "./animation_files/"
        onlyfiles = [
            f
            for f in listdir(animation_file_path)
            if isfile(join(animation_file_path, f))
        ]
        new_files = [
            int(f.split("_")[1].replace(".json", ""))
            for f in onlyfiles
            if f.startswith("new_")
        ]
        if len(new_files) > 0:
            max_file = max(new_files)
        else:
            max_file = 0
        next_filename = f"new_{max_file + 1}.json"
        try:
            file_name = request.args.get("file")
        except:
            file_name = next_filename

        if file_name:
            full_filepath = f"{animation_file_path}{file_name}"
        else:
            full_filepath = f"{animation_file_path}{file_name}"

        try:
            with open(full_filepath, "w") as fp:
                json.dump(sequence_json, fp, indent=4)
            return jsonify({"response": str(f"Saving as {file_name}")})
        except:
            return jsonify({"response": str("Failed to save animation file")})


# [DESCRIPTION] Deletes a provided filename from the animation_files directory. If provided filename does not exist, returns a response with that information.
# [OUTPUT]      json: A success or failure message.
@app.route("/delete-animation-file", methods=["POST"])
@cross_origin()
def delete_animation_file():
    if request.method == "POST":
        file_name = request.args.get("file")
        animation_file_path = "./animation_files/"
        full_filepath = f"{animation_file_path}{file_name}"
        if os.path.exists(full_filepath):
            os.remove(full_filepath)
            return jsonify({"response": f"Deleted {file_name}"})
        else:
            return jsonify(
                {"response": f"{file_name} does not exist. Nothing to delete."}
            )
        pass

#[DESCRIPTION] For a specified filename, returns the contents of the file in a response.
#              The contents of the file would typically be a full animation sequence.
#[OUTPUT] json: A string of all the angles of a sequence stored in an animation file.
@app.route("/get-single-file", methods=["GET"])
@cross_origin()
def get_single_file():
    if request.method == "GET":
        file_name = request.args.get("file")
        animation_file_path = "./animation_files/"
        onlyfiles = [
            f
            for f in listdir(animation_file_path)
            if isfile(join(animation_file_path, f))
        ]
        full_filepath = f"{animation_file_path}{file_name}"
        try:
            with open(full_filepath, "r") as fp:
                sequence = json.load(fp)
                return jsonify({"response": str(sequence)})
        except:
            return jsonify({"response": str("Failed to load animation file")})

# release_all_servos

# @app.route('/login',methods = ['POST', 'GET'])
# def login():
#    if request.method == 'POST':
#       user = request.form['name']
#       return redirect(url_for('dashboard',name = user))
#    else:
#       user = request.args.get('name')
#       return render_template('login.html')

#------------------------------------------#
#-------RUNNING THE MAIN APPLICATION-------#
#------------------------------------------#

if __name__ == "__main__":

    mc.send_angles([0,0,0,0,0,0], 50)
    mc.set_color(0,255,0)

    # app.run(debug = True, host='0.0.0.0')
    app.run(host="0.0.0.0", port=5000)