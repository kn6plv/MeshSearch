module.exports = {
  n2mh_site_exclude: function(url) {
    return url.hostname.toLowerCase().indexOf('n2mh') !== -1;
  },
  php_exclude: function(url) {
    return url.pathname.toLowerCase().endsWith('.php');
  }
}
