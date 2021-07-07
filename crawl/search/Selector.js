const Selector = {

  includeUrl(url) {
    return url.protocol === 'http:' && url.hostname.endsWith('.local.mesh');
  },

  includePageLinks(page) {
    return true;
  },

  includePageInSearch(page) {
    if (page.url.hostname === 'localnode.local.mesh') {
      return false;
    }
    return true;
  }

}

module.exports = Selector;
