var request = require('supertest');
describe('loading express', function () {
  
  var server;
  
  beforeEach(function () {
    server = require('../server');
  });
  
  afterEach(function () {
    server.close();
  });
  
  it('responds to /', function testSlash(done) {
    request(server)
      .get('/')
      .expect(200, done);
  });

  it('404 everything else', function testPath(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });

  it('lecturer', function testPath(done) {
    request(server)
      .get('/lecturer')
      .expect(200, done);
  });

  it('student', function testPath(done) {
    request(server)
      .get('/student')
      .expect(200, done);
  });

  it('questions', function testPath(done) {
    request(server)
      .get('/questions')
      .expect(200, done);
  });

  it('questionsCollection', function testPath(done) {
    request(server)
      .get('/questionsCollection')
      .expect(200, done);
  });

  it('counters', function testPath(done) {
    request(server)
      .get('/counters')
      .expect(200, done);
  });

});