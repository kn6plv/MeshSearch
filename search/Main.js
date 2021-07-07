#! /usr/bin/env node

const Config = require('../config/search');
const Log = require('debug')('web');
const Koa = require('koa');
const Router = require('koa-router');
const CacheControl = require('koa-cache-control');
const KoaCompress = require('koa-compress');
const Register = require('./Register');

const App = new Koa();

App.on('error', e => Log('apperror:', e));
process.on('uncaughtException', e => Log('uncaughtException:', e));
process.on('unhandledRejection', e => Log('unhandledRejection:', e));

App.use(CacheControl({ noCache: true }));
App.use(KoaCompress({}));
const root = Router();
Register(root);

App.use(root.middleware());
App.listen({ port: Config.port });
