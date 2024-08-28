import os
import re
import string
import emoji
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from pythainlp.corpus import thai_stopwords
from pythainlp.tokenize.multi_cut import mmcut
from collections import Counter
import pickle

# Flask app setup
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# URL of the dataset on GitHub
DATASET_URL = 'https://raw.githubusercontent.com/punchpatcha/thai-sms-detection/master/spamsmsdataset.csv'

# Function to load the model and vectorizer
def load_model_and_vectorizer():
    try:
        with open('model.pkl', 'rb') as f:
            clf_svc = pickle.load(f)
        with open('vectorizer.pkl', 'rb') as f:
            vect = pickle.load(f)
        return clf_svc, vect
    except FileNotFoundError:
        raise Exception("Model or vectorizer file not found.")
    except pickle.UnpicklingError:
        raise Exception("Error unpickling model or vectorizer.")

# Load the model and vectorizer
clf, cv = load_model_and_vectorizer()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json.get('message', '')
    if not data:
        return jsonify({"error": "Message is required"}), 400

    try:
        vect_data = cv.transform([data]).toarray()
        prediction = clf.predict(vect_data)[0]
        result = "spam" if prediction == 1 else "ham"
        return jsonify({"prediction": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/top-spam-words', methods=['GET'])
def top_spam_words():
    try:
        # Fetch the CSV file from GitHub
        sms = pd.read_csv(DATASET_URL, encoding='utf-8')

        # Process the data
        sms.dropna(inplace=True, axis=1)
        sms.columns = ["label", "msg"]
        sms["label_sign"] = sms.label.map({"ham": 0, "spam": 1})

        def clean_word(mess):
            nopunc = [char for char in mess if char not in string.punctuation and not any(emoji.is_emoji(c) for c in char)]
            nopunc = ''.join(nopunc)
            word_tokens = mmcut(nopunc)
            stopwords_th = thai_stopwords()
            filtered_sentence = [w for w in word_tokens if w not in stopwords_th]
            return ' '.join(filtered_sentence)

        sms["clean_msg"] = sms.msg.apply(clean_word)
        sms.dropna(subset=['label_sign'], inplace=True, axis=0)

        # Count words
        spam_words_counter = Counter()
        for msg in sms[sms.label == 'spam']['clean_msg']:
            words = mmcut(msg)
            words = [word for word in words if re.match(r'^[ก-๙]+$', word)]
            spam_words_counter.update(words)

        top_spam_words = spam_words_counter.most_common(10)
        return jsonify(top_spam_words)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Use the PORT environment variable provided by Render
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
