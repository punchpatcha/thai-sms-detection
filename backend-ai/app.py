import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import string
from pythainlp.corpus import thai_stopwords
from pythainlp.tokenize.multi_cut import mmcut
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.svm import LinearSVC
import pickle
import emoji
import numpy as np

# Flask app setup
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Function to load the model and vectorizer
def load_model_and_vectorizer():
    with open('model.pkl', 'rb') as f:
        clf_svc = pickle.load(f)
    with open('vectorizer.pkl', 'rb') as f:
        vect = pickle.load(f)
    return clf_svc, vect

# Load the model and vectorizer
clf, cv = load_model_and_vectorizer()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json['message']
    vect_data = cv.transform([data]).toarray()
    prediction = clf.predict(vect_data)[0]
    proba = clf.decision_function(vect_data)[0]  # Get the distance from the decision boundary
    proba = np.abs(proba)  # Absolute value to represent confidence

    # Normalize the probability for visualization
    max_proba = np.max([proba, 1 - proba])  # 1 - proba for the opposite class
    proba_percentage = proba / max_proba * 100

    result = "spam" if prediction == 1 else "ham"
    return jsonify({
        "prediction": result,
        "probability": proba_percentage,
        "confidence": proba
    })

if __name__ == '__main__':
    # Use the PORT environment variable provided by Render
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
