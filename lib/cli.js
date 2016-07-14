#!/usr/bin/env node
'use strict';

const meow = require('meow');
const HostPinger = require('./HostPinger');
const render = require('./render');

const cli = meow(`
    Usage
      $ host-pinger [alias@]host, [[alias@]host...]

    Options
      -a, --amount Amount of pings. Infinitely (0) by default;
      -d, --delay Delay in ms. 1000 by Default;
      -h, --help Get help;

    Examples
      host-pinger Home@192.168.1.1 62.117.4.217 -a 20 -d 1000
`, {
  alias: {
    a: 'amount',
    d: 'delay',
    h: 'help'
  }
});

if (!cli.input.length) {
  console.log('You need at least one host. See host-pinger -h for help');
  process.exit(0);
}

let hostPinger = new HostPinger({
  amount: cli.flags.amount || 0,
  delay: cli.flags.delay || 1000,
  hosts: parseHosts(cli.input)
});

hostPinger.start(servers => render(servers));
hostPinger.on('error', () => {});

function parseHosts(hosts) {
  return hosts.map(host => {
    host += '';
    let index = host.indexOf('@');
    if (index === -1) return host;
    return {alias: host.slice(0, index), host: host.slice(index + 1)};
  });
}


