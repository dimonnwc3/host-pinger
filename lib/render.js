'use strict';

const chalk = require('chalk');
const logUpdate = require('log-update');

function makeTemplate(servers) {

  let output = [];

  servers.forEach(s => {

    let str;

    if (s.error || (typeof s.ping == 'string')) {
      str = `* ${s.alias || s.hostName}: ${chalk.red(s.ping)}`;
    }

    if (s.ping < 50) {
      str = `* ${s.alias || s.hostName}: ${chalk.green(s.ping)}`;
    }

    if (s.ping >= 50 && s.ping <= 100) {
      str = `* ${s.alias || s.hostName}: ${chalk.yellow(s.ping)}`;
    }

    if (s.ping > 100) {
      str = `* ${s.alias || s.hostName}: ${chalk.red(s.ping)}`;
    }

    output.push(str);

  });

  return output;

}

function render(servers) {
  let template = makeTemplate(servers);
  logUpdate(template.join('\n'));
}

module.exports = render;