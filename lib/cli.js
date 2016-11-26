#!/usr/bin/env node
'use strict';

const meow = require('meow');
const HostPinger = require('./HostPinger');
const render = require('./render');

const {
  NO_ARGUMENTS_ERR,
  HELP,
  AMOUNT,
  DELAY,
  USAGE,
  ERR
} = require('./constants');

const cli = meow(USAGE, {
  alias: {
    a: AMOUNT,
    d: DELAY,
    h: HELP
  }
});

if (!cli.input.length) {
  console.log(NO_ARGUMENTS_ERR);
  process.exit(0);
}

const hostPinger = new HostPinger({
  amount: cli.flags.amount,
  delay: cli.flags.delay,
  hosts: parseHosts(cli.input)
});

hostPinger.start(servers => render(servers));
hostPinger.on(ERR, () => {});

function parseHosts(hosts) {
  return hosts.map(host => {
    host += '';
    const index = host.indexOf('@');
    if (index === -1) return host;
    return {alias: host.slice(0, index), host: host.slice(index + 1)};
  });
}