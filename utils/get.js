#! /usr/bin/env node

const Config = require('../config/search');
const MeiliSearch = require('../search/node_modules/meilisearch');

const Client = new MeiliSearch.MeiliSearch({
  host: Config.engineHost,
  apiKey: Config.key
});
const Index = Client.index(Config.index);

Index.getDocument(process.argv[2]).then(doc => {
  console.log(JSON.stringify(doc, null, 2));
});
