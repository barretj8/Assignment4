require('dotenv').config();
const AWS = require('aws-sdk');
const dynamoose = require('dynamoose');

const express = require('express');
const config = require('./config/config');
const compression = require('compression');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');

const User = require('./models/user');
const userRouter = require('./routes/user.routes');
const postRouter = require('./routes/post.routes');

const app = express();

app.set('view engine', 'ejs');
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());
app.use(mongoSanitize());
app.use(express.static('public'));

app.set('trust proxy', 1);

const port = config.get('port') || 3000;
const blogDB = config.get('db.name');
const blog_db_url =
  config.get('db.db_url') +
  config.get('db.password') +
  config.get('db.host') +
  blogDB +
  '?retryWrites=true&w=majority';

// Set up DynamoDB schema for blog posts
const BlogPostSchema = new dynamoose.Schema({
  postId: String,
  title: String,
  content: String,
  // Include other fields as needed
});

// Create Dynamoose model for blog posts
const BlogPostModel = dynamoose.model('BlogPost', BlogPostSchema);

app.use(
  session({
    secret: config.get('secret'),
    resave: false,
    store: MongoStore.create({
      mongoUrl: blog_db_url,
      ttl: 2 * 24 * 60 * 60,
    }),
    saveUninitialized: false,
    cookie: { secure: 'auto' },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

app.use('/user', userRouter);
app.use('/post', postRouter);

app.all('*', function (req, res) {
  res.redirect('/post/about');
});

app.listen(port, () => {
  console.log('Server started on port ' + port);
});

module.exports = app;
