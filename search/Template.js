
const FS = require('fs');
const Glob = require('fast-glob');
const Handlebars = require('handlebars');

const Template = {};
function loadTemplates() {
  Glob.sync([ `**.html` ], { cwd: __dirname }).forEach(template => {
    const name = template.replace(/\//g, '').replace(/\.html$/, '');
    const func = Handlebars.compile(FS.readFileSync(`${__dirname}/${template}`, { encoding: 'utf8' }));
    Template[name] = ctx => {
      return func(ctx, {
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true
      });
    }
    Handlebars.registerPartial(name, Template[name]);
  });
}
Template.load = loadTemplates;

Handlebars.registerHelper({
  print: function() {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    console.log(args);
  },
  eq: function (v1, v2) {
    return v1 == v2;
  },
  ne: function (v1, v2) {
    return v1 != v2;
  },
  lt: function (v1, v2) {
    return v1 < v2;
  },
  gt: function (v1, v2) {
    return v1 > v2;
  },
  lte: function (v1, v2) {
    return v1 <= v2;
  },
  gte: function (v1, v2) {
    return v1 >= v2;
  },
  and: function () {
    return Array.prototype.slice.call(arguments).every(Boolean);
  },
  or: function () {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
  },
  not: function(v) {
    return !v;
  },
  add: function(v1, v2) {
    return v1 + v2;
  },
  sub: function(v1, v2) {
    return v1 - v2;
  },
  mul: function(v1, v2) {
    return v1 * v2;
  },
  div: function(v1, v2) {
    return v1 / v2;
  },
  mod: function(v1, v2) {
    return v1 % v2;
  },
  fixed: function(v, f) {
    return Number(Number(v).toFixed(f)).toLocaleString();
  },
  array: function() {
    return Array.prototype.slice.call(arguments, 0, -1);
  },
  isdefined: function(v) {
    return v !== undefined && v !== null;
  },
  concat: function() {
    return String.prototype.concat.apply("", Array.prototype.slice.call(arguments, 0, -1));
  },
  date: function(d) {
    return new Date(d).toDateString()
  },
  now: function() {
    return Date.now();
  },
  cuttext(text, pre, max) {
    if (!text) {
      return text;
    }
    let p = text.indexOf('<em>');
    if (p === -1) {
      return text.substring(0, max);
    }
    if (p > pre) {
      text = text.substring(p - pre);
    }
    p = text.search(/\s/);
    const e = text.substring(p + max).search(/\s/);
    return text.substring(p, p + max + e).trim();
  },
  queryselect(start, end, step, pos, max) {
    const list = [];
    let count = 0;
    for (let i = pos; i >= start && count < max / 2; i -= step, count++) {
      list.unshift(i);
    }
    for (let i = pos + step; i < end && count < max; i += step, count++) {
      list.push(i);
    }
    return list;
  }
});

module.exports = Template;
