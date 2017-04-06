# Kolab
The Kolab App

### [Screenshots](/screenshots/screenshots.md)

### Use npm to install all dependencies
1. Navigate to the folder you've placed the project in with terminal/cmd
2. Run: `npm install`

### Run the server
1. `cd` into the directory that contains the server.js file
2. Run the server using this command: `nodemon server.js`

### Preparing and running the python NLP script
1. `cd` into the directory of nlp.py
2. Install python dependencies by running this command: `pip install package && pip freeze > requirements.txt`
3. Run the python script by running this command: `python nlp.py`
(Requires Python 3.4+,  if you have several version it needs to be specified: `python3 nlp.py`)

### Visit the website
- Open <http://localhost:3000> in your web browser

### MongoDB
1. Run MongoDB: `mongod`
2. `mongo`
3. Show databases: `show dbs`
4. Create or use a database: `use kolabDB`
5. Show the content of the database: `db.questionsCollection.find()`
6. Show the content of the database pretty: `db.questionsCollection.find().pretty()`