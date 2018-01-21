var Raven = require('raven');
Raven.config('https://de8033ae4fdb4f0097aadb579fb2dbaf:e84ca576414a416c890cf59fd1938ff1@sentry.io/275023').install();

var Twit = require("twit");
var fs = require("fs");
let dat = JSON.parse(fs.readFileSync("out.json"));
let seen = JSON.parse(fs.readFileSync("seen.json"));

let keys = Object.keys(dat).filter(key=>seen[key]===undefined);

function saveFile(data) {
  let d = JSON.stringify(data);
  fs.writeFileSync("seen.json", d);
}

var T = new Twit({
  consumer_key: "...",
  consumer_secret: "...",
  access_token: "...",
  access_token_secret: "...",
  timeout_ms: 60 * 1000 // optional HTTP request timeout to apply to all requests.
});

function neuterUrl(url) {
  return url.replace(".", "․");
}

function formatTweet(key) {
  let { url, category, price } = dat[key];
  return `${neuterUrl(url)}   \n\n ${price}`;
}

console.log(seen.length + "/" + keys.length);
let key = keys.pop();
let status = formatTweet(key);
console.log(status);

T.post("statuses/update", { status }, function(err, data, response) {
  console.log(err, data);
});

seen[key] = true;

saveFile(seen);
