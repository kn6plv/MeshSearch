const NegList = require('./NegList');

const Selector = {

  includeUrl(to, from) {
    return this._include(to, from, NegList.excludeUrl);
  },

  includePageLinks(page) {
    return this._include(page.url, null, NegList.excludePageLinks);
  },

  includePageInSearch(page) {
    return this._include(page.url, null, NegList.excludePageInSearch);
  },

  _include(to, from, exclude) {
    for (let key in exclude) {
      if (exclude[key](to, from)) {
        return false;
      }
    }
    return true;
  }

}

module.exports = Selector;
