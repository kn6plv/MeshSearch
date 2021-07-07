
const Log = require('debug')('search');
const Template = require('./Template');

const Search = async function(ctx) {
  Template.load();
  ctx.type = 'text/html';
  ctx.body = Template.Search({});
}

module.exports = Search;
