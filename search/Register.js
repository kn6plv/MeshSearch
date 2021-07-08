const FS = require('fs');

const CACHE_MAXAGE = 24 * 60 * 60; // 24 hours

const Pages = {
  '/':                  { fn: require('./Search') },
  '/q':                 { fn: require('./Query') },
  '/css/main.css':      { path: `${__dirname}/main.css`, type: 'text/css' }
};

function Register(root) {

  if (!process.env.DEBUG) {
    for (let name in Pages) {
      const page = Pages[name];
      if (page.fn) {
        page.get = page.fn;
      }
      else {
        const data = FS.readFileSync(page.path, { encoding: page.encoding || 'utf8' });
        page.get = async ctx => {
          ctx.body = data;
          ctx.type = page.type;
          if (CACHE_MAXAGE) {
            ctx.cacheControl = { maxAge: CACHE_MAXAGE };
          }
        }
      }
    }
  }
  else {
    for (let name in Pages) {
      const page = Pages[name];
      if (page.fn) {
        page.get = page.fn;
      }
      else {
        page.get = async ctx => {
          ctx.body = FS.readFileSync(page.path, { encoding: page.encoding || 'utf8' });
          ctx.type = page.type;
        }
      }
    }
  }

  for (let name in Pages) {
    root.get(name, Pages[name].get);
  }

}

module.exports = Register;
