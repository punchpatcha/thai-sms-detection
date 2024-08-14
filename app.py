from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import string
from pythainlp.corpus import thai_stopwords
from pythainlp.tokenize.multi_cut import mmcut
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.svm import LinearSVC
import emoji
import requests
from io import StringIO

# Flask app setup
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Function to load data from GitHub
def load_data_from_github():
    url = 'https://raw.githubusercontent.com/punchpatcha/thai-sms-detection/master/spamsmsdataset.csv'
    response = requests.get(url)
    response.raise_for_status()  # Ensure we notice bad responses
    csv_data = StringIO(response.text)
    df = pd.read_csv(csv_data, encoding='utf-8')
    return df

# Model training code 
def train_model():
    sms = load_data_from_github()
    
    # Print the first few rows to understand the structure
    print("First few rows of the dataset:")
    print(sms.head())

    sms.columns = ["v1", "v2"] 
    sms.dropna(inplace=True)
    sms["label_sign"] = sms.v1.map({"ham": 0, "spam": 1})

    def clean_word(mess):
        nopunc = [char for char in mess if char not in string.punctuation and not any(emoji.is_emoji(c) for c in char)]
        nopunc = ''.join(nopunc)
        word_tokens = mmcut(nopunc)
        stopwords_th = thai_stopwords()
        filtered_sentence = [w for w in word_tokens if w not in stopwords_th]
        return ' '.join(filtered_sentence)

    sms["clean_msg"] = sms.v2.apply(clean_word)
    sms.dropna(subset=['label_sign'], inplace=True)

    X_train, X_test, y_train, y_test = train_test_split(sms.clean_msg, sms.label_sign, random_state=1)
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
