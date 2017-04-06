# Kolab
[![Build Status](https://travis-ci.com/TobiasSH/PU-2017-Kolab.svg?token=XPoxJGAcCUwTmyc9W9ea&branch=develop)](https://travis-ci.com/TobiasSH/PU-2017-Kolab) [![Coverage Status](https://coveralls.io/repos/github/TobiasSH/PU-2017-Kolab/badge.svg?branch=develop)](https://coveralls.io/github/TobiasSH/PU-2017-Kolab?branch=develop)

### [Screenshots](/screenshots/screenshots.md)

### Use npm to install all dependencies
1. Navigate to the folder you've placed the project in with terminal/cmd
2. Run: `npm install`

### Run the server
1. `cd` into the directory that contains the server.js file
2. Run the server using this command: `nodemon server`

### Visit the website
- Open <http://localhost:3000> in your web browser

### MongoDB
1. Run MongoDB: `mongod`
2. `mongo`
3. Show databases: `show dbs`
4. Create or use a database: `use kolabDB`
5. Show the content of the database: `db.questionsCollection.find()`
6. Show the content of the database pretty: `db.questionsCollection.find().pretty()`
