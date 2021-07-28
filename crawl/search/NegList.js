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
    },

    // This is causing me trouble so avoid for the moment until I fix it properly
    DSLRcam: function(url) {
      return url.pathname.toLowerCase().indexOf('dslrcam') !== -1;
    }

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
