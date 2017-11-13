const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const moment = require('moment');
const Twit = require('twit');
const config = require('./config.js');
const T = new Twit(config);

app.use(bodyParser.urlencoded({ extended: false}));
app.use('/static', express.static('public'));
app.set('view engine', 'pug');

app.get('/', (req, res)=>{
  T.get("account/verify_credentials").then(verifiedUser => {
    const verifiedScreenName = verifiedUser.data.screen_name;
    Promise.all([
      T.get('users/lookup', { screen_name: verifiedScreenName }),
      T.get('statuses/user_timeline', { screen_name: verifiedScreenName, count: 5 }),
      T.get('friends/list', { count: 5 }),
      T.get('direct_messages', { count: 5 })
    ]).then( ([userData, tweetData, friendData, dmData]) => {
      let templateData = {
        user: getUser(userData.data),
        tweets: getTweetData(tweetData.data),
        friends: getFriendData(friendData.data),
        messages: getDmData(dmData.data),
      }
      return res.render('app', templateData);
    }).catch(error => {
      throw error;
    });
  }).catch(error=>{
    throw error;
  })
});

app.post('/', (req, res)=>{
  let tweetText = req.body.tweet;
  T.post("statuses/update", { status: tweetText }).then(()=>{
    res.redirect('/');
  });
});

let port=Number(process.env.PORT || 3000);
app.listen(port, () => {
    console.log('The application is running on localhost:3000');
});

// Handle 404
app.use(function(req, res) {
  res.status(400);
 res.render('error', {title: 'Oops, that\'s not a real page'});
});

// Handle 500
app.use(function(error, req, res, next) {
  res.status(500);
  res.render('error', {title:'Hmm, something\'s not working here', error: error});
});

function getUser(data){
  let user = data[0];
  let newUser = {};
  newUser.name = user.name; 
  newUser.screen_name = user.screen_name;
  newUser.profile_image_url_https = user.profile_image_url_https;
  newUser. profile_banner_url = user.profile_banner_url;
  newUser.friends_count = user.friends_count;
  return newUser;
};
function getTweetData(data){
  let tweets = data;
  let allTweets = [];
  for(i=0;i<tweets.length;i++){
    let tweet = tweets[i];
    let newTweet = {};
    newTweet.name = tweet.user.name;
    newTweet.screen_name = tweet.user.screen_name;
    newTweet.profile_image_url_https = tweet.user.profile_image_url_https;
    newTweet.text = tweet.text;
    newTweet.favorite_count = tweet.favorite_count;
    newTweet.retweet_count = tweet.retweet_count;
    newTweet.created_at = tweet.created_at;
    newTweet.from_now = moment(new Date(tweet.created_at)).fromNow();
    allTweets.push(newTweet);
  }
  return allTweets;
};
function getFriendData(data){
  let friends = data.users;
  let allFriends = [];
  for(i=0;i<friends.length;i++){
    let friend = friends[i];
    let newFriend = {};
    newFriend.name = friend.name;
    newFriend.screen_name = friend.screen_name;
    newFriend.profile_image_url_https = friend.profile_image_url_https;
    allFriends.push(newFriend);
  }
  return allFriends;
};
function getDmData(data){
  let messages = data;
  let allMessages = [];
  for(i=0;i<messages.length;i++){
    let newMessage = {};
    let message = messages[i];  
    newMessage.text = message.text;
    newMessage.created_at = message.created_at;
    newMessage.sender_name = message.sender.name;
    newMessage.sender_screen_name = message.sender.screen_name;
    newMessage.sender_profile_image_url_https = message.sender.profile_image_url_https;
    newMessage.from_now = moment(new Date(message.created_at)).fromNow();
    allMessages.push(newMessage);
  }
  return allMessages;
};