const Engine = require('./engine');

module.exports = {
  dns: [ '10.50.254.161' ],
  engineHost: `http://${Engine.address}`,
  key: Engine.privateKey,
  index: 'web1',
  crawlFrequency: 4 * 60 * 60, // Every 4 hours
  threads: 8,
  getTimeout: 60,
  getProgressTimeout: 10,
  userAgent: 'Mozilla/5.0 (compatible;AREDNCrawlBot;+tim.j.wilkinson+kn6plv@gmail.com)'
};
