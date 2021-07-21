const Engine = require('./engine');

module.exports = {
  dns: [ '10.153.127.81' ],
  engineHost: `http://${Engine.address}`,
  key: Engine.privateKey,
  index: 'web1',
  crawlFrequency: 4 * 60 * 60, // Every 4 hours
  threads: 8,
  getTimeout: 10
};
