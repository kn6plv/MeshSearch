const NegList = require('./NegList');

const Selector = {

  includeUrl(url) {
    return this._include(url, NegList.excludeUrl);
  },

  includePageLinks(page) {
    return this._include(page.url, NegList.excludePageLinks);
  },

  includePageInSearch(page) {
    return this._include(page.url, NegList.excludePageInSearch);
  },

  _include(url, exclude) {
    for (let key in exclude) {
      if (exclude[key](url)) {
        return false;
      }
    }
    return true;
  }

}

module.exports = Selector;
