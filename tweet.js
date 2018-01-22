#!/usr/bin/env node
let Raven = require("raven");
Raven.config(
  "https://de8033ae4fdb4f0097aadb579fb2dbaf:e84ca576414a416c890cf59fd1938ff1@sentry.io/275023"
).install();

let fs = require("fs");
let path = p => require("path").resolve(__dirname, p);
let { T } = require("./creds");
let _ = require("lodash");

let dat = JSON.parse(fs.readFileSync(path("out.json")));
let seen = JSON.parse(fs.readFileSync(path("seen.json")));

let keys = Object.keys(dat).filter(key => seen[key] === undefined);

function saveFile(data) {
  let d = JSON.stringify(data);
  fs.writeFileSync(path("seen.json"), d);
}

function neuterUrl(url) {
  return url.replace(".", "․");
}

function formatTweet(key) {
  let { url, category, price } = dat[key];
  return `${neuterUrl(url)}   \n\n ${price}`;
}

keys = _.shuffle(keys);

let key = keys.pop();
let status = formatTweet(key);
console.log(status);

T.post("statuses/update", { status }, function(err, data, response) {
  // console.log(err, response);
});

seen[key] = true;

saveFile(seen);
