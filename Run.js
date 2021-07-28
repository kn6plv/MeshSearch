#! /usr/bin/env node

const Config = require('./config/engine');
const ChildProcess = require('child_process');

ChildProcess.spawn(`${__dirname}/MeiliSearch/target/release/meilisearch`,
  [
    `--http-addr=${Config.address}`,
    `--master-key=${Config.masterKey}`,
    `--db-path=${__dirname}/${Config.db}`,
    `--no-analytics=1`
  ],
  {
    stdio: 'inherit'
  }
);
ChildProcess.spawn(`${__dirname}/search/Main.js`, [], { stdio: 'inherit' });
ChildProcess.spawn(`${__dirname}/crawl/Main.js`, [], { stdio: 'inherit' });
