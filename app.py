from flask import Flask, jsonify
from flask_cors import CORS

def create_app():
    # Application-factory pattern
    app = Flask(__name__)
    CORS(app)

    @app.route('/click', methods=['GET'])
    def click():
        return jsonify({'response': 'you clicked the button'})

    return app

if __name__ == '__main__':
   app = create_app()
   app.run(host='0.0.0.0', port=5000)