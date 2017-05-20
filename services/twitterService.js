/**
 * Created by Luca on 20.05.2017.
 */

var config              = require("../utils/config"),
    fs                  = require('fs'),
    Twitter             = require('twitter'),
    twitterClients      = [];

function getAccount(identifier) {
  if(identifier in twitterClients) return twitterClients[identifier];
  if(!(identifier in config.twitterAccounts)) return null;

  twitterClient = new Twitter({
    consumer_key: config['twitterAccounts'][identifier]['consumer_key'],
    consumer_secret: config['twitterAccounts'][identifier]['consumer_secret'],
    access_token_key: config['twitterAccounts'][identifier]['access_token_key'],
    access_token_secret: config['twitterAccounts'][identifier]['access_token_secret']
  });

  twitterClients.push(twitterClient);
  return twitterClient;
}

function _uploadMedia(identifier, filePath, next) {

    var twitterClient = getAccount(identifier);

    if(identifier==null) return next({"result":"error","reason":"Account not found by identifier"});

    var file = fs.readFileSync(filePath);
    twitterClient.post("media/upload", {media: file}, function(error, media, response) {
        if(error) { return next({"result":"error","code":"4"}); }
        console.log("[Twi][Twee] Media uploaded");
        return next({"result":"success","media_id_string":JSON.parse(response.body).media_id_string});
    });
}

function sendTweet(identifier, status, next) {

    var twitterClient = getAccount(identifier);

    if(identifier==null) return next({"result":"error","reason":"Account not found by identifier"});

    twitterClient.post("statuses/update", status, function(error, tweet, response) {
        if(error) {

            var code = JSON.parse(response.body).errors[0].code;
            return next({"result":"error","code":"5", "reason":code});
        }
        return next({"result":"success"});
    });
}

function _sendDirectMessage(identifier, userid, message) {
    var twitterClient = getAccount(identifier);

    if(identifier==null) return next({"result":"error","reason":"Account not found by identifier"});

    twitterClient.post('direct_messages/new', {user_id: userid, text: message},  function(error, tweet, response) {});
}

module.exports = {
    uploadMedia       : function(filePath, next) { _uploadMedia(filePath,next); },
    sendTweet         : sendTweet,
    sendDirectMessage : function(userid, message)   { _sendDirectMessage(userid,message); }
}
