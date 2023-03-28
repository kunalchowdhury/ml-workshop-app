from flask import Flask, request
from flask_cors import CORS, cross_origin

app = Flask(__name__)

app.config['SECRET_KEY'] = 'secret_key'
app.config['CORS_HEADERS'] = 'Content-Type'

cors = CORS(app, resources={r"/predict": {"origins": "http://localhost:3000/"}})

@app.route('/predict', methods=['GET'])
@cross_origin(origin='localhost', headers=['Content-Type', 'Authorization'])
def predict():
    return {'data': [{'instrumentId': 'abcd1', 'actual': 82.3, 'predicted': 95.3, 'diff': 5.3}, 
		    {'instrumentId': 'abcd2', 'actual': 112.3, 'predicted': 182.3, 'diff': 2.3}, 
		    {'instrumentId': 'abcd3', 'actual': 514.3, 'predicted': 519.3, 'diff': 9.3}, 
		    {'instrumentId': 'abcd4', 'actual': 128.3, 'predicted': 140.3, 'diff': 14.3}],
	   'pltImg': 'http://54.152.131.225:5000/dataplot.png'}

if __name__ == '__main__':
    app.run(debug=True)