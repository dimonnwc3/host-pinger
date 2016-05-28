'use strict';

const chalk = require('chalk');
const logUpdate = require('log-update');

function makeTemplate(servers) {

  let output = [];

  servers.forEach(server => {

    let str;

    if (server.error || (typeof server.ping == 'string')) {
      str = `* ${server.alias || server.hostName}: ${chalk.red(server.ping)}`;
    }

    if (server.ping < 50) {
      str = `* ${server.alias || server.hostName}: ${chalk.green(server.ping)}`;
    }

    if (server.ping >= 50 && server.ping <= 100) {
      str = `* ${server.alias || server.hostName}: ${chalk.yellow(server.ping)}`;
    }

    if (server.ping > 100) {
      str = `* ${server.alias || server.hostName}: ${chalk.red(server.ping)}`;
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