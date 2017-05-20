/**
 * Created by Luca on 20.05.2017.
 */

var config          = require("./utils/config");

console.log("[Sys][Info] Starting \"Tweet-Replier\" - Service");

var twitterReceiver = require("./services/twitterReceiver");
