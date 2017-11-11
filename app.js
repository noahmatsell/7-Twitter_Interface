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
// app.use(bodyParser.urlencoded({ extended: false}));
// app.use(cookieParser());
app.use('/static', express.static('public'));
app.set('view engine', 'pug');

app.get('/', (req, res)=>{
  Promise.all([
    T.get('users/lookup', { screen_name: 'nonojamesm' }),
    T.get('statuses/user_timeline', { screen_name: 'nonojamesm', count: 5 }),
    T.get('friends/list', { count: 5 }),
    T.get('direct_messages', { count: 5 })
  ]).then( (userData, tweetData, friendData, dmData)=> {
    console.log('promises complete');
    console.log(userData[0].data);
    console.log(tweetData.data);
    console.log(friendData.data);
    console.log(dmData.data);
    
    var templateData = {
      "user": getUser(userData),
      "tweets": tweetData(tweetData),
      "friends": friendData(friendData),
      "messages": dmData(dmData)
    }
    console.log(templateData);

    res.render('app', { templateData });

  }).catch(error => {
    throw error;
  });
});

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


function getUser(data){
  console.log('getting user');
  var user = data[0];
  var newUser = {};
  newUser.name = user.name; 
  newUser.screen_name = user.screen_name;
  newUser.profile_image_url_https = user.profile_image_url_https;
  return newUser;
};
function getTweets(data){
  console.log('getting tweets');
  var tweets = data;
  var allTweets = [];
  tweets.forEach(function(tweet) {
    var newTweet = {};
    newTweet.user.name = tweet.user.name;
    newTweet.user.screen_name = tweet.user.screen_name;
    newTweet.user.profile_image_url_https = tweet.user.profile_image_url_https;
    newTweet.text = tweet.text;
    newTweet.favorite_count = tweet.favorite_count;
    newTweet.retweet_count = tweet.retweet_count;
    newTweet.created_at = tweet.created_at;
    allTweets.push(newTweet);
  });
  return allTweets;
};
function getFriends(data){
  console.log('getting friends');
  var friends = data.users;
  var allFriends = [];
  friends.forEach(function(friend) {
    var newFriend = {};
    newFriend.name = friend.name;
    newFriend.screen_name = friend.screen_name;
    newFriend.profile_image_url_https = friend.profile_image_url_https;
    allFriends.push(newFriend);
  });
  return allFriends;
};
function getMessages(data){
  console.log('getting messages');
  var messages = data;
  var allMessages = [];
  messages.forEach(function(message) {
    var newMessage = {};  
    newMessage.text = message.text;
    newMessage.created_at = message.created_at;
    newMessage.sender.name = message.sender.name;
    newMessage.sender.screen_name = message.sender.screen_name;
    newMessage.sender.profile_image_url_https = message.sender.profile_image_url_https;
    allMessages.push(newMessage);
  });
  return allMessages;
};
