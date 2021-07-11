
const Config = require('../config/search');
const Log = require('debug')('search');
const URL = require('url');
const MeiliSearch = require('meilisearch');
const Template = require('./Template');

const RESULTS_PER_PAGE = 10;
const VALID_TIME = 24 * 60 * 60 * 1000; // 24 hours

const Client = new MeiliSearch.MeiliSearch({
  host: Config.engineHost,
  apiKey: Config.key
});
const Index = Client.index(Config.index);

async function DoSearch(ctx) {
  const search = new URL.URLSearchParams(ctx.querystring);
  const query = search.get('q');
  if (!query) {
    return null;
  }
  const offset = parseInt(search.get('o') || 0);
  Log(query, offset);
  const results = await Index.search(query.trim(), {
    offset: offset,
    limit: RESULTS_PER_PAGE,
    attributesToHighlight: [ 'main' ],
    filters: `last_index_time > ${Date.now() - VALID_TIME}`
  });
  Log(results);
  return results;
}

const Search = async function(ctx) {
  Template.load();
  ctx.type = 'text/html';
  ctx.body = Template.Search({ body: await DoSearch(ctx) });
}

const Query = async function(ctx) {
  Template.load();
  ctx.type = 'text/html';
  ctx.body = Template.SearchBody(await DoSearch(ctx));
}

module.exports = {
  Search: Search,
  Query: Query
};
