#! /usr/bin/env node

const DNS = require('dns');
const Crypto = require('crypto');
const Config = require('../config/crawl');
const HttpPage = require('../crawl/HttpPage');
const SearchSelector = require('../crawl/search/Selector');
const Robots = require('../crawl/search/Robots');

if (Config.dns) {
  const resolver = new DNS.Resolver();
  resolver.setServers(Config.dns);
  const lookup = (hostname, _, callback) => {
    resolver.resolve4(hostname, (err, addresses) => {
      if (err) {
        callback(err);
      }
      else {
        callback(null, addresses[0], 4);
      }
    });
  }
  HttpPage.setDNS(lookup);
}

const page = new HttpPage({ url: process.argv[2] });
page.getStatus().then(status => {
  const hash = Crypto.createHash('sha1');
  hash.update(page.url.toString());
  console.log('Id:', hash.digest('hex'));
  if (status !== 200) {
    console.log('Error', status, page.url.toString());
  }
  else {
    console.log('Title:', page.getTitle().title);
    console.log('Content-Type:', page.getContentType());
    const links = page.getLinks().links;
    if (SearchSelector.includePageLinks(page)) {
      if (links.length) {
        console.log('Links:');
        links.forEach(url => {
          if (SearchSelector.includeUrl(url, page.url)) {
            console.log(`  ${url.origin}${url.pathname}${url.search}`);
          }
        });
      }
    }
    else {
      console.log('Links: excluded');
    }
    const main = page.getSignificantText().text;
    if (main) {
      console.log('Main:', main.substring(0, 100), `(len = ${main.length})`);
    }
  }
  console.log('inSearch:', SearchSelector.includePageInSearch(page));
  Robots.canCrawl(page.url.toString()).then(okay => console.log('Robots:', okay));
});
