'use strict';

const chalk = require('chalk');
const logUpdate = require('log-update');


const HostPinger = require('./lib/HostPinger');

let hostPinger = new HostPinger({
  hosts: [
    'login.p1.worldoftanks.net',
    'login.p2.worldoftanks.net',
    'login.p3.worldoftanks.net',
    'login.p4.worldoftanks.net',
    'login.p5.worldoftanks.net',
    'login.p6.worldoftanks.net',
    'login.p7.worldoftanks.net',
    'login.p8.worldoftanks.net',
    'login.p9.worldoftanks.net',
    {alias: 'RU10', host: 'login.p10.worldoftanks.net'},
    '192.168.1.1'
  ]
});

hostPinger.start((err, servers) => {
  render(servers);
});

function makeTemplate(servers) {

  let output = [];

  servers.forEach(server => {

    let str;

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

