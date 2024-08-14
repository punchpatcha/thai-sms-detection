from flask import Flask, request, jsonify

from flask_cors import CORS


import pandas as pd
import re
import string
from pythainlp.corpus import thai_stopwords
from pythainlp.tokenize.multi_cut import mmcut
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.svm import LinearSVC
from sklearn import metrics
import pickle
import emoji

# Flask app setup
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Model training code
def train_model():
    file_path = "C:\\Punch\\Thai-sms-detection\\backend-ai\\spamsmsdataset.csv"
    sms = pd.read_csv(file_path, encoding='utf-8')
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

    X_train, X_test, y_train, y_test = train_test_split(sms.msg, sms.label_sign, random_state=1)
    vect = CountVectorizer()
    X_train_dim = vect.fit_transform(X_train)
    X_test_dim = vect.transform(X_test)

    clf_svc = LinearSVC(C=1, dual=False)
    clf_svc.fit(X_train_dim, y_train)

    # Save the model and vectorizer to memory instead of disk
    return clf_svc, vect

# Train the model when the Flask app starts
clf, cv = train_model()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json['message']
    vect_data = cv.transform([data]).toarray()
    prediction = clf.predict(vect_data)[0]
    result = "spam" if prediction == 1 else "ham"
    return jsonify({"prediction": result})

if __name__ == '__main__':
    app.run(debug=True)
