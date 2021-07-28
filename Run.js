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
ChildProcess.spwan(`${__dirname}/search/Main`, [], { stdio: 'inherit' });
ChildProcess.spwan(`${__dirname}/crawl/Main`, [], { stdio: 'inherit' });
