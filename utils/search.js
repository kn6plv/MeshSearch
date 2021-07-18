#! /usr/bin/env node

const Config = require('../config/search');
const MeiliSearch = require('../search/node_modules/meilisearch');

const RESULTS_PER_PAGE = 10;
const VALID_TIME = 24 * 60 * 60 * 1000; // 24 hours

const Client = new MeiliSearch.MeiliSearch({
  host: Config.engineHost,
  apiKey: Config.key
});
const Index = Client.index(Config.index);

Index.search(process.argv.slice(2).join(' ').trim(), {
  offset: 0,
  limit: RESULTS_PER_PAGE,
  attributesToRetrieve: [ 'url', 'title',  ],
  filter: `last_index_time > ${Date.now() - VALID_TIME}`
}).then(results => console.log(JSON.stringify(results, null, 2)));
