import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS

# Load the model from a file
model = joblib.load('linear_regression_model.pkl')

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Hello, World!"

@app.route('/Model', methods=['POST'])
def model_predict():
    data = request.get_json()
    move = data['move']
    prediction = model.predict([[move]])
    return jsonify(prediction=int(prediction[0]))

if __name__ == '__main__':
    app.run(port=8080, debug=True)
