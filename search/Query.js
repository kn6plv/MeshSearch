const Config = require('../config/search');
const Log = require('debug')('query');
const URL = require('url');
const MeiliSearch = require('meilisearch');
const Template = require('./Template');

const RESULTS_PER_PAGE = 10;

const Client = new MeiliSearch.MeiliSearch({
  host: Config.engineHost,
  apiKey: Config.publicKey,
});
const Index = Client.index(Config.index);


const Query = async function(ctx) {
  Template.load();
  const search = new URL.URLSearchParams(ctx.querystring);
  const query = search.get('q');
  const offset = parseInt(search.get('o') || 0);
  Log(query, offset);
  if (!query) {
    ctx.type = 'text/html';
    ctx.body = '';
  }
  else {
    const results = await Index.search(query, {
      offset: offset,
      limit: RESULTS_PER_PAGE,
      attributesToHighlight: [ 'main' ]
    });
    Log(results);
    ctx.type = 'text/html';
    ctx.body = Template.SearchBody(results);
  }
}

module.exports = Query;
