import string
from flask import Flask, request, jsonify
import pickle
from pythainlp.tokenize.multi_cut import mmcut
from pythainlp.corpus import thai_stopwords
import re
import emoji

app = Flask(__name__)

# Load the trained model and vectorizer
clf_svc = pickle.load(open('spam_linear_svc_model.pkl', 'rb'))
cv = pickle.load(open('transform.pkl', 'rb'))

def clean_word(mess):
    nopunc = [char for char in mess if char not in string.punctuation and not any(emoji.is_emoji(c) for c in char)]
    nopunc = ''.join(nopunc)
    word_tokens = mmcut(nopunc)
    stopwords_th = thai_stopwords()
    filtered_sentence = [w for w in word_tokens if w not in stopwords_th]
    return ' '.join(filtered_sentence)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    message = data['message']
    clean_message = clean_word(message)
    vect_message = cv.transform([clean_message]).toarray()
    prediction = clf_svc.predict(vect_message)[0]
    
    result = 'spam' if prediction == 1 else 'ham'
    
    return jsonify({'prediction': result})

if __name__ == "__main__":
    app.run(debug=True)
