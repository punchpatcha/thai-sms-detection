import pandas as pd
import string
from pythainlp.corpus import thai_stopwords
from pythainlp.tokenize.multi_cut import mmcut
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.svm import LinearSVC
import pickle
import emoji
import requests
from io import StringIO

# Function to load data from GitHub
def load_data_from_github():
    url = 'https://raw.githubusercontent.com/punchpatcha/thai-sms-detection/master/spamsmsdataset.csv'
    response = requests.get(url)
    csv_data = StringIO(response.text)
    df = pd.read_csv(csv_data, encoding='utf-8')
    return df

# Model training code
def train_model():
    sms = load_data_from_github()
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

    X_train, X_test, y_train, y_test = train_test_split(sms.clean_msg, sms.label_sign, random_state=1)
    vect = CountVectorizer()
    X_train_dim = vect.fit_transform(X_train)
    X_test_dim = vect.transform(X_test)

    clf_svc = LinearSVC(C=1, dual=False)
    clf_svc.fit(X_train_dim, y_train)

    # Save the model and vectorizer to disk
    with open('model.pkl', 'wb') as f:
        pickle.dump(clf_svc, f)
    with open('vectorizer.pkl', 'wb') as f:
        pickle.dump(vect, f)

    print("Model and vectorizer saved.")

if __name__ == "__main__":
    train_model()
