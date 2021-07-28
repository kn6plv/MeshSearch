module.exports = {

  excludeUrl: {

    // Default

    offmesh: function(url) {
      return !(url.protocol === 'http:' && url.hostname.endsWith('.local.mesh'));
    },

    // Custom

    n2mhSites: function(url) {
      return url.hostname.toLowerCase().indexOf('n2mh') !== -1;
    },
    php: function(url) {
      return url.pathname.toLowerCase().endsWith('.php');
    }

  },

  excludePageLinks: {

    // Default - none

    // Custom

    uradmonitor: function(url) {
      return url.hostname.toLowerCase().indexOf('uradmonitor') !== -1;
    }
  },

  excludePageInSearch: {

    // Default

    localnode: function(url) {
      return url.hostname === 'localnode.local.mesh';
    }

    // Custom
  }
}
