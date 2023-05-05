const { connect, connection } = require('mongoose');
//Link to the mongodb database, the db we are using is studentsDB and can also be viewed inside MongoDB Compass
const connectionString =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/socialmediaDB';
// Takes the link where the db exists and connects
connect(connectionString);

module.exports = connection;