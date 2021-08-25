const Engine = require('./engine');

module.exports = {
  engineHost: `http://${Engine.address}`,
  key: Engine.privateKey,
  index: 'web1',
  root: 'http://kn6plv-brkoxfla-omni.local.mesh/',
  crawlFrequency: 4 * 60 * 60, // Every 4 hours
  threads: 8,
  getTimeout: 60,
  getProgressTimeout: 10,
  userAgent: 'Mozilla/5.0 (compatible;AREDNCrawlBot;+tim.j.wilkinson+kn6plv@gmail.com)'
};
