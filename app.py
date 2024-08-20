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
from collections import Counter

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

# Function to clean and tokenize SMS messages
def clean_word(mess):
    nopunc = [char for char in mess if char not in string.punctuation and not any(emoji.is_emoji(c) for c in char)]
    nopunc = ''.join(nopunc)
    word_tokens = mmcut(nopunc)
    stopwords_th = thai_stopwords()
    filtered_sentence = [w for w in word_tokens if w not in stopwords_th]
    return filtered_sentence

# Preprocess data to find top spam words
file_path ="C:\Punch\Thai-sms-detection\backend-ai\spamsmsdataset.csv"
sms = pd.read_csv(file_path, encoding='utf-8')
sms.dropna(inplace=True, axis=1)
sms.columns = ["label", "msg"]
sms["clean_msg"] = sms.msg.apply(clean_word)

# Count words in spam messages
spam_words_counter = Counter()
for msg in sms[sms.label == 'spam']['msg']:
    words = clean_word(msg)
    spam_words_counter.update(words)

# Top 10 spam words
top_spam_words = spam_words_counter.most_common(10)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json['message']
    vect_data = cv.transform([data]).toarray()
    prediction = clf.predict(vect_data)[0]
    result = "spam" if prediction == 1 else "ham"
    return jsonify({"prediction": result})

@app.route('/top-spam-words', methods=['GET'])
def get_top_spam_words():
    words_data = [{"word": word, "frequency": count} for word, count in top_spam_words]
    return jsonify(words_data)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
