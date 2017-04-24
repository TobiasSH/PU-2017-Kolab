from datetime import datetime
start_time = datetime.now()

import nltk
nltk.data.path.append('nltk_data/')
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet

from socketIO_client import SocketIO, BaseNamespace


stop_words = set(stopwords.words("english"))  # Retrieving stop words from corpus

lemmatizer = WordNetLemmatizer()  # Setup of the lemmatizer

print ("Load time: ", str(datetime.now() - start_time))


def get_wordnet_pos(treebank_tag):  # conversion from the treebank tag of nltk-tagger, to wordnet tags
    if treebank_tag.startswith('J'):
        # print("Returned : ", str(wordnet.ADJ ))
        return wordnet.ADJ
    elif treebank_tag.startswith('V'):
        # print("Returned : ", str(wordnet.VERB))
        return wordnet.VERB
    elif treebank_tag.startswith('N'):
        # print("Returned : ", str(wordnet.NOUN))
        return wordnet.NOUN
    elif treebank_tag.startswith('R'):
        # print("Returned : ", str(wordnet.ADV))
        return wordnet.ADV
    elif treebank_tag.startswith('A'):
        # print("Returned : s")
        return 's'
    else:
        # print("No hits, returned : n")
        return 'n'


print ("Load time before NLTK processing: ", str(datetime.now() - start_time))
nltk_start = datetime.now()

def processNew(newmessage):  # Used when a new question arrives
    try:
        print ("Original question: ", str(newmessage['text']), end='')  # This is the original question
        lowercasedoc = newmessage['text'].lower()  # lowercase so that the stop words can be compared
        filtered_sentence = []  # list for the filtered sentence, w.o stop words
        nouns = ""
        words = word_tokenize(lowercasedoc)  # tokenize on word so we can use a POS tagger
        tagged = nltk.pos_tag(words)  # POS tagging
        print ("Tagged items: ", str(tagged))

        for word in tagged:  # Breaking questions into words
            # print ("this is the word :", str(word[0]))
            lemmatized = lemmatizer.lemmatize(word[0],get_wordnet_pos(word[1]))  # Stemming of each word in a question
            # print ("Lemmatized word: ", word)
            if lemmatized not in stop_words:  # Removing stop words, if the word is a stop word we do not add it to the list
                filtered_sentence.append(lemmatized)
                if word[1].startswith('N'):
                    nouns+=lemmatized
                    nouns+=" "
        if len(nouns)==0:
            nouns+="Uncategorized"

        print ("This is the document at the end", str(newmessage))
        #db.questionsCollection.update({'_id': newmessage['_id']}, {"$set": {'tag': nouns}}, upsert=False)
        msg = {'_id': newmessage['_id'],'room': newmessage['room'], 'text': newmessage['text'], 'tag': nouns}
        print ("This is the message: ",msg)
        socketIO.emit('processed message', msg)
        print ("Processed question: " + str(filtered_sentence))  # This is the processed question
        print ("These are the nouns: ", str(nouns))
        print ()
    except Exception as e:
        print (str(e))



##  SOCKETIO

class Namespace(BaseNamespace):
    def on_connect(self):
        print('[Connected]')

    def on_reconnect(self):
        print('[Reconnected]')

    def on_disconnect(self):
        print('[Disconnected]')

    def on_pp_message(self, message):
        processNew(message)


#
print ("Connecting to socketIO.. Port is: ", 80)
socketIO = SocketIO('kolab-group.herokuapp.com', 80, Namespace)
#socketIO = SocketIO('localhost', 3000, Namespace)
socketIO.wait() #waits forever


print ("Total time: ", str(datetime.now() - start_time))
