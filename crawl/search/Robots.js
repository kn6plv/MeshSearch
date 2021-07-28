
const RobotsParser = require('robots-parser');
const URL = require('url');
const fetch = require('node-fetch');
const NegList = require('./NegList');
const Log = require('debug')('robots');

const ROBOTS_AGENT = 'AREDNCrawlBot';
const ROBOTS_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

let sites = {};
const pending = {};

class Robots {

  constructor() {
    setTimeout(() => sites = {}, ROBOTS_TIMEOUT);
  }

  async canCrawl(url) {
    Log('canCrawl:', url);
    const u = new URL.URL(url);
    const txt = `${u.protocol}//${u.host}/robots.txt`;
    for (let attempt = 0; attempt < 2; attempt++) {
      const parser = sites[txt];
      if (parser) {
        const okay = parser.isAllowed(url, ROBOTS_AGENT);
        if (okay) {
          Log('+++', url, okay);
        }
        else {
          Log('---', url, okay);
        }
        return okay;
      }
      if (!pending[txt]) {
        const exclude = NegList.excludeRobots;
        for (let key in exclude) {
          if (exclude[key](u)) {
            sites[txt] = { isAllowed: () => true };
            return true;
          }
        }
        pending[txt] = new Promise(async resolve => {
          try {
            Log('fetch:', txt);
            const req = await fetch(txt);
            const contents = await req.text();
            sites[txt] = new RobotsParser(txt, contents);
            Log('Added:', txt);
          }
          catch (e) {
            Log(e);
            switch (e.code) {
              case 'ECONNREFUSED':
              case 'EHOSTUNREACH':
                sites[txt] = { isAllowed: () => false };
                break;
              default:
                sites[txt] = { isAllowed: () => true };
                break;
            }
          }
          delete pending[txt];
          resolve();
        });
      }
      await pending[txt];
    }
    Log('---', url, false);
    return false;
  }

}

module.exports = new Robots();
