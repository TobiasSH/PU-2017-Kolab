[![Build Status](https://travis-ci.com/TobiasSH/PU-2017-Kolab.svg?token=XPoxJGAcCUwTmyc9W9ea&branch=develop)](https://travis-ci.com/TobiasSH/PU-2017-Kolab) [![Coverage Status](https://coveralls.io/repos/github/TobiasSH/PU-2017-Kolab/badge.svg?branch=develop)](https://coveralls.io/github/TobiasSH/PU-2017-Kolab?branch=develop)

# Kolab
Kolab is a student project in the subject TDT4145 - Software development at NTNU.
The team has developed a real-time web application which aims at engaging students during classes. With the application you can ask questions during the lecture and give various feedback, such as: "We're moving too quickly", "I fell off", "Speak louder" and so on.
Lecturers are able to make a "room" for their lectures, and the students can join the specific room. The lecturer will be able to see the percentage of students who have given the aforementioned feedback as well as the questions. The application utilizes a separate natural language processing script which makes us able to group questions based on their subject.

The project was developed using MEAN stack with socketIO and a separate python script using NLTK and socketIO.

### [Screenshots](/screenshots/screenshots.md)

## Walkthrough for running the project locally

### Use npm to install all dependencies
1. Navigate to the folder you've placed the project in with terminal/cmd
2. Install all node package dependencies with: `npm install`
3. Install all python dependencies with: `pip install -r requirements.txt` 
(*the python script and its dependencies require python 3.5+, if you have both python 2.7 and 3.5+ installed you need to specify with: `pip3 install -r requirements.txt`)

### Run the server
1. `cd` into the directory that contains the server.js file
2. Run the server using this command: `nodemon server.js`

### Run the python script
1. Open the nlp.py file and navigate down to the bottom of the file
2. Change `socketIO = SocketIO('kolab-group.herokuapp.com', 80, Namespace)` to `socketIO = SocketIO('localhost', 3000, Namespace)`
3. Use the terminal and `cd` into the directory of nlp.py
4. Run the python script by running this command: `python nlp.py`
(Same applies here, if you have several python version you need to specify that you're using python 3: `python3 nlp.py`)

### Visit the website
- Open <http://localhost:3000> in your web browser

### MongoDB, locally
##### You will have to change server.js database connection and the python script mongodb connection if you want to run everything locally
1. Run MongoDB: `mongod`
2. Start the mongodb shell: `mongo`
3. Show databases: `show dbs`
4. Create or use a database: `use kolabDB`
5. Show the content of the database: `db.questionsCollection.find()`
6. Show the content of the database pretty: `db.questionsCollection.find().pretty()`
