const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");

function neuterUrl(url) {
  return url.replace(".", "․");
}
function saveFile(data) {
  let d = JSON.stringify(data);
  fs.writeFileSync("out.json", d);
}

async function fetchData(url, json = false) {
  const options = {
    uri: url,
    headers: {
      "User-Agent": "Request-Promise"
    },
    json: json
  };
  try {
    var body = await request.get(options);
    return body;
  } catch (err) {
    console.log("Got an error:", err);
  }
}

const concurrency = 1;
let outstanding = 0;


let c = "";

let db = {};
// PriceAsc
async function scrapePage(offset) {
  let data = await fetchData(
    `https://www.hugedomains.com/domain_search.cfm?dot=all&anchor=all&highlightbg=1&maxrows=100&catsearch=0&sort=PriceDesc&oc=0&start=${offset}`
  );
  const $ = cheerio.load(data);
  // c = $
  let rows = $("table").text().split("Buy Now").slice(2);
  //console.log(data)
  let vs = rows.map(r => r.trim().split(/\n/).filter(x => x.trim()).slice(1));
  console.log(vs,offset)
  vs.map(parseRow).forEach(storeRow);
  storeRow(db);
  if (offset < 9899) {
//    console.log(Object.keys(db).length);
    scrapePage(offset + 100);
  } else {
    saveFile(db);
  }
}
function parseRow(row) {
  let [url, category, price] = row;
  //  console.log("parseRow" ,row,url,category,price)
  return { url, category, price };
}
function storeRow(row) {
  let key = row.url;
  //console.log(row);
  if (!key) {
    return;
  }
  //console.log(row);
  db[key] = row;
  // console.log(db);
}

scrapePage(0);
