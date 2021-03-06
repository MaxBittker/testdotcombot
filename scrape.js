const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
let db = JSON.parse(fs.readFileSync("out.json"));

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

async function scrapePage(offset) {
  let data = await fetchData(
    `https://www.hugedomains.com/cat/recreation/?start=${offset}&domain_name=&catSearch=258&dot=all&anchor=all&highlightbg=1&length_start=&length_end=&price_from=&price_to=&maxrows=100&sort=`
  );
  // `https://www.hugedomains.com/cat/recreation/humor/?start=${offset}&domain_name=&catSearch=262&dot=all&anchor=all&highlightbg=1&length_start=&length_end=&price_from=&price_to=&maxrows=100&sort=`
  // `https://www.hugedomains.com/domain_search.cfm?start=${offset}&domain_name=&catSearch=96&dot=all&anchor=all&highlightbg=1&length_start=&length_end=&price_from=&price_to=&maxrows=100&sort=`
  // `https://www.hugedomains.com/cat/arts/?start=${offset}&domain_name=&catSearch=22&dot=all&anchor=all&highlightbg=1&length_start=&length_end=&price_from=&price_to=&maxrows=100&sort=`
  // `https://www.hugedomains.com/domain_search.cfm?dot=all&anchor=all&highlightbg=1&maxrows=100&catsearch=0&sort=PriceAsc&oc=0&start=${offset}`

  const $ = cheerio.load(data);
  let rows = $("table").text().split("Buy Now").slice(2);
  let vs = rows.map(r => r.trim().split(/\n/).filter(x => x.trim()).slice(1));

  console.log(vs, offset);

  vs.map(parseRow).forEach(storeRow);
  storeRow(db);
  if (offset < 9999) {
    scrapePage(offset + 100);
  } else {
    saveFile(db);
  }
}

function parseRow(row) {
  let [url, category, price] = row;
  return { url, category, price };
}

function storeRow(row) {
  let key = row.url;
  if (!key) {
    return;
  }
  db[key] = row;
}

scrapePage(0);
