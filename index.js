'use strict';

const dns = require('dns');
const chalk = require('chalk');
const logUpdate = require('log-update');
const ping = require('net-ping');
const co = require('co');

let servers;

let allIps = true;

let hosts = [
  'login.p1.worldoftanks.net',
  'login.p2.worldoftanks.net',
  'login.p3.worldoftanks.net',
  'login.p4.worldoftanks.net',
  'login.p5.worldoftanks.net',
  'login.p6.worldoftanks.net',
  'login.p7.worldoftanks.net',
  'login.p8.worldoftanks.net',
  'login.p9.worldoftanks.net',
  'login.p10.worldoftanks.net'
];

let session = ping.createSession();

// function getServerHostName(i) {
//   return `login.p${i}.worldoftanks.net`;
// }

function* getServers(hosts) {
  let servers = [];

  for (let i = 0; i < hosts.length; i++) {
    servers.push(getServer(hosts[i]));
  }

  return yield servers;
}

function getServer(host) {
  return new Promise((resolve, reject) => {
    dns.lookup(host, (err, address) => {
      if (err) return reject(err);
      resolve({name: host, address: address});
    });
  });
}

function* getPings(servers) {

  let pingedServers = [];

  for (let i = 0; i < servers.length; i++) {
    let ping = pingAddr(servers[i]);
    pingedServers.push(ping);
  }

  return yield pingedServers;
}

// function* pingServer(server) {

//   let pings = [];

//   for (let i = 0; i < server.addresses.length; i++) {
//     let ping = yield pingAddr(server.addresses[i]);
//     pings.push(ping);
//   }

//   let sum = pings.reduce((a, b) => a + b);
//   let result = Math.round(sum / pings.length);
//   return result;

// }

function pingAddr(server) {
  return new Promise((resolve, reject) => {
    session.pingHost(server.address, (err, target, sent, rcvd) => {
      if (err) return reject(err);
      server.ping = rcvd - sent;
      resolve(server);
    });
  });
}

function makeTemplate(servers) {

  let output = [];

  servers.forEach(server => {

    let str;

    if (server.ping < 50) {
      str = `* ${server.name}: ${chalk.green(server.ping)}`;
    }

    if (server.ping >= 50 && server.ping <= 100) {
      str = `* ${server.name}: ${chalk.yellow(server.ping)}`;
    }

    if (server.ping > 100) {
      str = `* ${server.name}: ${chalk.red(server.ping)}`;
    }

    output.push(str);

  });

  return output;

}

function render(servers) {
  let template = makeTemplate(servers);
  logUpdate(template.join('\n'));
}


co(function*() {
  servers = yield* getServers(hosts);
  let pingedServers = yield* getPings(servers);
  render(pingedServers);
});

setInterval(() => {

  co(function*() {
    let pingedServers = yield* getPings(servers);
    render(pingedServers);
  });

}, 1000);


session.on('close', () => {
  console.log('closed');
});

session.on('error', err => {
  console.error(`error: ${err}`);
  session.close();
});
