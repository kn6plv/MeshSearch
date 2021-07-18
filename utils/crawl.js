#! /usr/bin/env node

const DNS = require('dns');
const Crypto = require('crypto');
const Config = require('../config/crawl');
const HttpPage = require('../crawl/HttpPage');
const SearchSelector = require('../crawl/search/Selector');

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

const page = new HttpPage({ url: process.argv[2], dns: lookup });
page.getStatus().then(status => {
  if (status !== 200) {
    console.log('Error', status, page.url.toString());
    return;
  }
  const hash = Crypto.createHash('sha1');
  hash.update(page.url.toString());
  console.log('Id:', hash.digest('hex'));
  console.log('Title:', page.getTitle().title);
  console.log('Content-Type:', page.getContentType());
  const links = page.getLinks().links;
  if (SearchSelector.includePageLinks(page)) {
    if (links.length) {
      console.log('Links:');
      links.forEach(url => {
        if (SearchSelector.includeUrl(url)) {
          console.log(`  ${url.origin}${url.pathname}${url.search}`);
        }
      });
    }
  }
  else {
    console.log('*** Links no included');
  }
  if (!SearchSelector.includePageInSearch(page)) {
    console.log('*** Page exclude');
  }
});
