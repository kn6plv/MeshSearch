module.exports = {

  excludeUrl: {

    // Default

    offmesh: function(to, from) {
      return !(to.protocol === 'http:' && to.hostname.endsWith('.local.mesh'));
    },

    // Custom

    // Exclude PHP links unless they come directly from a main mesh index page. Some PHP links may
    // have side effects, so best to only shallow-crawl them.
    php: function(to, from) {
      return to.pathname.toLowerCase().endsWith('.php') && from.pathname !== '/cgi-bin/mesh';
    },

    n2mhSites: function(to, from) {
      return to.hostname.toLowerCase().indexOf('n2mh') !== -1;
    },

  },

  excludePageLinks: {

    // Default - none

    // Custom

    // Do not fetch any links as some of them will cause the device to reset.
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
  },

  excludeRobots: {

    // Default - none

    // Custom

    // Do not fetch the robots.txt file for any uradmonitor as the '/r' part of robots.txt will
    // reset the device.
    uradmonitor: function(url) {
      return url.hostname.toLowerCase().indexOf('uradmonitor') !== -1;
    }

  }
}
