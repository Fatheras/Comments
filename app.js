const express = require('express');
const app = express();
//const objectId = require("mongodb").ObjectID;
//const mongo = require('mongodb');
//const commentsDB = "mongodb://localhost:27017/comments";
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

//const user = require('./models/commentSchema.js');
const bodyParser = require('body-parser');
//const jsonParser = bodyParser.json();
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const routes = require('./routes/index.js');
const url = 'mongodb://localhost:27017/comments';
const port = 3000;

app.set('view engine', 'ejs');
routes(app);
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');


app.post('/submitComment', function(req, res) {
    debugger;
  console.log(req.body); //This prints the JSON document received (if it is a JSON document)

  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db('comments');
    var userName = req.body.name;
    var userComment = req.body.comment;
    var userParrentID = '';

    var data = {
      name: userName,
      comment: userComment,
      parrentID: userParrentID
    }
    console.log(data);

    dbo.collection('userComments').insertOne(data, function(err, res) {
      if (err) throw err;
      console.log('1 document inserted');
      db.close();
    });
  });
});
const conn = mongoose.createConnection(url);

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('comments');
});

const storage = new GridFsStorage({
  url: url,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'userComments'
        };
        resolve(fileInfo);
      });
    });
  }
});


const upload = multer({
  storage
});
app.get('/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists'
      });
    }

    // Check if image
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
});

app.post('/submitComment2', upload.single('file'), (req, res) => {
  console.log(req.file);
  res.json({ file: req.file });
  //res.redirect('/');
});

app.get('/getComments',(req,res)=>{
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("comments");
    dbo.collection("userComments").find({}).toArray(function(err, result) {
      if (err) throw err;
      console.log(result);
      db.close();

      return JSON.stringify(result);
    });
  });
});

app.listen(port, () => console.log(`Server started on port ${port}`));
