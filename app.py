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
    result = "spam" if prediction == 1 else "ham"
    
    # Extract word frequencies for the bubble chart
    word_frequencies = extract_word_frequencies(data)
    
    return jsonify({
        "prediction": result,
        "wordFrequencies": word_frequencies
    })

def extract_word_frequencies(message):
    # Tokenize and clean the message
    tokens = mmcut(message)
    tokens = [word for word in tokens if word not in thai_stopwords.get_stopwords()]
    
    # Count word frequencies
    word_counts = pd.Series(tokens).value_counts().to_dict()
    
    # Mock categories for demo; replace with actual logic to classify words if needed
    word_frequencies = [
        {"word": word, "ham": count if 'ham' in word else 0, "spam": count if 'spam' in word else 0}
        for word, count in word_counts.items()
    ]
    
    return word_frequencies

if __name__ == '__main__':
    # Use the PORT environment variable provided by Render
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
