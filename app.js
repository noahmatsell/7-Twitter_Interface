const express = require('express');
const app = express();
//const bodyParser = require('body-parser');
//const cookieParser = require('cookie-parser');
const Twit = require('twit');
const config = require('./config.json');

var T = new Twit({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token: config.access_token,
  access_token_secret: config.access_token_secret,
  timeout_ms: 60*1000,  // optional HTTP request timeout to apply to all requests.
});

T.get('users/lookup', { screen_name: 'nonojamesm' },  function (err, data, response) {
  console.log(data)
});

//Your 5 most recent tweets.
  //GET statuses / user_timeline
  //Returns a collection of the most recent Tweets posted by the indicated by the screen_name or user_id parameters.
//Your 5 most recent friends.
//Your 5 most recent private messages.

// app.use(bodyParser.urlencoded({ extended: false}));
// app.use(cookieParser());
app.use('/static', express.static('public'));
app.set('view engine', 'pug');

app.use((request,res,next)=>{
  const err = new Error('Oh no!');
  err.status = 500;
  next(err);
});

app.use((req, res, next) =>{
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next)=>{
  res.locals.error = err;
  res.status(err.status);
  res.render('error');
});
var port=Number(process.env.PORT || 3000);
app.listen(port, () => {
    console.log('The application is running on localhost:3000');
});