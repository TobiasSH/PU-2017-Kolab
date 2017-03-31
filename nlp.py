from datetime import datetime

start_time = datetime.now()
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize, PunktSentenceTokenizer
from nltk.stem import PorterStemmer, WordNetLemmatizer
from pymongo import MongoClient
from nltk.corpus import wordnet

# CONNECTION TO HEROKU DATABASE
#connection = MongoClient('mongodb://kolabgroup:12345678@ds119020.mlab.com:19020/heroku_2hcp9k8k')
#db = connection["heroku_2hcp9k8k"]#


# CONNECTION TO MY TEST DATABASE
connection = MongoClient('mongodb://kolabgroup:12345678@ds115110.mlab.com:15110/kolabdb')
db = connection["kolabdb"]

questionsData = db.questionsCollection.find()  # Retrieving data from database

stop_words = set(stopwords.words("english"))  # Retrieving stop words from corpus

stemmer = PorterStemmer()  # Setting up the porter stemmer function

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


# for doced in questionsData:
#    if doced['tag']:
#        print (str(doced['tag']))
print ("Load time before NLTK processing: ", str(datetime.now() - start_time))
nltk_start = datetime.now()


def startup():  # Used when we restart the system, uses information from database
    try:
        for document in questionsData:
            print ("maymes", document['tag'])
            if not document['tag']:
                print ("Original question: ", str(document['text']), end='')  # This is the original question

                lowercasedoc = document['text'].lower()  # lowercase so that the stop words can be compared
                filtered_sentence = []  # list for the filtered sentence, w.o stop words
                nouns = []
                words = word_tokenize(lowercasedoc)  # tokenize on word so we can use a POS tagger
                tagged = nltk.pos_tag(words)  # POS tagging
                # chunkGram = r""" Chunk: {<RB>} """ #CHUNKING
                print ("Tagged items: ", str(tagged))

                for word in tagged:  # Breaking questions into words
                    # print ("this is the word :", str(word[0]))
                    lemmatized = lemmatizer.lemmatize(word[0],
                                                      get_wordnet_pos(word[1]))  # Stemming of each word in a question
                    # print ("Lemmatized word: ", word)
                    if lemmatized not in stop_words:  # Removing stop words, if the word is a stop word we do not add it to the list
                        filtered_sentence.append(lemmatized)
                        if word[1].startswith('N'):
                            nouns.append(lemmatized)
                print ("This is the document at the end", str(document))
                db.questionsCollection.update({'_id': document['_id']}, {"$set": {'tag': nouns}}, upsert=False)
                print ("Processed question: " + str(filtered_sentence))  # This is the processed question
                print ("These are the nouns: ", str(nouns))
                print ()
    except Exception as e:
        print (str(e))



startup()


print ("NLTK processing: ", str(datetime.now() - nltk_start))

def processNew(newmessage):  # Used when a new question arrives
    try:
        #print ("maymes", newmessage['tag'])
        print ("This it the newmessage",newmessage)
        print ("Original question: ", str(newmessage['text']), end='')  # This is the original question

        lowercasedoc = newmessage['text'].lower()  # lowercase so that the stop words can be compared
        filtered_sentence = []  # list for the filtered sentence, w.o stop words
        nouns = []
        words = word_tokenize(lowercasedoc)  # tokenize on word so we can use a POS tagger
        tagged = nltk.pos_tag(words)  # POS tagging
        # chunkGram = r""" Chunk: {<RB>} """ #CHUNKING
        print ("Tagged items: ", str(tagged))

        for word in tagged:  # Breaking questions into words
            # print ("this is the word :", str(word[0]))
            lemmatized = lemmatizer.lemmatize(word[0],
                                              get_wordnet_pos(word[1]))  # Stemming of each word in a question
            # print ("Lemmatized word: ", word)
            if lemmatized not in stop_words:  # Removing stop words, if the word is a stop word we do not add it to the list
                filtered_sentence.append(lemmatized)
                if word[1].startswith('N'):
                    nouns.append(lemmatized)
        print ("This is the document at the end", str(newmessage))
        #db.questionsCollection.update({'_id': newmessage['_id']}, {"$set": {'tag': nouns}}, upsert=False)
        msg = {'_id': newmessage['_id'], 'text': newmessage['text'], 'tag': nouns }
        print ("This is the message: ",msg)
        socketIO.emit('processed message', msg)
        print ("Processed question: " + str(filtered_sentence))  # This is the processed question
        print ("These are the nouns: ", str(nouns))
        print ()
    except Exception as e:
        print (str(e))


# ### SPACY ATTEMPTS
#
# #def processNew():  # Used when a new question arrives
# #    return True
# spacy_start = datetime.now()
# import spacy
#
# nlp = spacy.load('en')
#
# doc = nlp(u'Hello, spacy!')          # See "Using the pipeline"
# print((w.text, w.pos_) for w in doc)
#
#
#
# #print ("This is the question data",questionsData)
#
# for word in questionsData:
#     print ("Printing within the loop")
#     print(word.text, word.lemma, word.lemma_, word.tag, word.tag_, word.pos, word.pos_)
#
# print ("NLTK processing: ", str(datetime.now() - spacy_start))


## BACK TO SOCKETIO

from socketIO_client import SocketIO, BaseNamespace


class Namespace(BaseNamespace):
    def on_connect(self):
        print('[Connected]')

    def on_reconnect(self):
        print('[Reconnected]')

    def on_disconnect(self):
        print('[Disconnected]')

    def on_pp_message(self, message):
        processNew(message)

socketIO = SocketIO('localhost', 3000, Namespace) #connects to localhost:3000
socketIO.wait() #waits forever


print ("Total time: ", str(datetime.now() - start_time))
