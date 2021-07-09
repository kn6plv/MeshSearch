const Engine = require('./engine');

module.exports = {
  port: 7701,
  engineHost: `http://${Engine.address}`,
  key: Engine.publicKey,
  index: 'web1'
};
