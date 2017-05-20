/**
 * Created by Luca on 20.05.2017.
 */

var config                = require("../utils/config"),
    utils                 = require("../utils/utils"),
    twitterService        = require("./twitterService"),
    Twit                  = require('twit'),
    accounts              = require("../utils/accounts"),
    twitterReceiverClient = new Twit({
                                consumer_key:         config['twitterAccounts']['twitter-demineforce-bot']['consumer_key'],
                                consumer_secret:      config['twitterAccounts']['twitter-demineforce-bot']['consumer_secret'],
                                access_token:         config['twitterAccounts']['twitter-demineforce-bot']['access_token_key'],
                                access_token_secret:  config['twitterAccounts']['twitter-demineforce-bot']['access_token_secret'],
                                timeout_ms:           60*1000,
                             }),
    twitterReceiveStream  = twitterReceiverClient.stream('statuses/filter',{ follow: combineAccounts() });

function combineAccounts() {
  var accountList = "";
  for(var i = 0; i < Object.keys(accounts).length; i++) {
    accountList+=accounts[i]['userid']+((i+1<Object.keys(accounts).length)?", ":"");
  }
  return accountList;
}

function convertRepliesIDs(tweet) {
  if(tweet.in_reply_to_status_id_str==null) return "";

  var replyList = "";

  for(var i = 0; i < Object.keys(tweet.entities.user_mentions).length; i++)
    replyList+=tweet.entities.user_mentions[i]['id_str']+((i+1<Object.keys(tweet.entities.user_mentions).length)?", ":"");

  return replyList;
}

function convertRepliesNames(tweet) {
  if(tweet.in_reply_to_status_id_str==null) return "";

  var replyList = " ";

  for(var i = 0; i < Object.keys(tweet.entities.user_mentions).length; i++)
    replyList+="@"+tweet.entities.user_mentions[i]['screen_name']+((i+1<Object.keys(tweet.entities.user_mentions).length)?" ":"");

  return replyList;
}

twitterReceiveStream.on('tweet', function (tweet) {
    var id_str = tweet.id_str;
    var in_reply_to_status_id_str = tweet.in_reply_to_status_id_str;

    if(typeof id_str === 'undefined') return;

    var object = null;

    for(var i = 0; i < Object.keys(accounts).length; i++) if(accounts[i]['userid']==tweet.user.id_str) {
        object = accounts[i];

        if(object['include-replies'] || in_reply_to_status_id_str == null) {
          console.log("[Twi][Twee] Found valid twitter account @"+tweet.user.screen_name+" for reply: "+object['reply']);
          twitterService.sendTweet(object['account'],{status:"@"+tweet.user.screen_name+convertRepliesNames(tweet)+" "+object['reply']+" ["+utils.makeid()+"]",in_reply_to_status_id:id_str},function(result) {
            if(result.result === "error") return console.log("[Twi][Twee] Error occured: "+result.reason);
            console.log("[Twi][Twee] Tweet sent for twitter account @"+tweet.user.screen_name+" with reply: "+object['reply']);
});
        }

     }

}).on('error', function(error) {
    console.log(error);
});
