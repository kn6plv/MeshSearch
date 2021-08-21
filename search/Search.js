
const Config = require('../config/search');
const Log = require('debug')('search');
const URL = require('url');
const MeiliSearch = require('meilisearch');
const Template = require('./Template');

const RESULTS_PER_PAGE = 10;
const RESULTS_PER_SEARCH = RESULTS_PER_PAGE * 100;
const VALID_TIME = 12 * 60 * 60 * 1000; // 12 hours
const HIGHLIGHTS = [ 'main', 'main1', 'main2', 'main3', 'main4', 'main5', 'main6', 'main7', 'main8', 'main9' ];
const HIGHLIGHT_CROP = 350;

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
    offset: 0,
    limit: RESULTS_PER_SEARCH,
    attributesToHighlight: HIGHLIGHTS,
    filters: `last_index_time > ${Date.now() - VALID_TIME}`,
    cropLength: HIGHLIGHT_CROP
  });
  results.offset = offset;
  results.limit = RESULTS_PER_PAGE;
  results.hits = results.hits.slice(offset, offset + RESULTS_PER_PAGE);
  results.hits.forEach(hit => {
    const key = HIGHLIGHTS.find(key => hit._formatted[key] && hit._formatted[key].indexOf('<em>') !== -1);
    if (key) {
      hit._formatted.main = hit._formatted[key];
    }
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
