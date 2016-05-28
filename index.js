'use strict';

const HostPinger = require('./lib/HostPinger');
const render = require('./lib/render');

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
    '192.168.1.1',
    '10.0.1.1',
    '123s'
  ]
});

hostPinger.start(servers => {
  render(servers);
});

hostPinger.on('error', err => {
  //console.log(err);
});

module.exports = HostPinger;