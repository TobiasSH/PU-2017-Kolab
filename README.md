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
2. Install python dependencies by running this command: `pip install -r requirements.txt`
(This script and its dependencies requires python 3.5+, and if you have several versions of python it needs to be specified,
as follows: `pip3 install -r requirements.txt`)
3. Run the python script by running this command: `python nlp.py`
(Same applies here, if you have several python version you need to specify: `python3 nlp.py`)

### Visit the website
- Open <http://localhost:3000> in your web browser

### MongoDB, locally
### You will have to change server.js database connection and the python script mongodb connection if you want to run everything locally
1. Run MongoDB: `mongod`
2. `mongo`
3. Show databases: `show dbs`
4. Create or use a database: `use kolabDB`
5. Show the content of the database: `db.questionsCollection.find()`
6. Show the content of the database pretty: `db.questionsCollection.find().pretty()`