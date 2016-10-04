'use strict';

const USAGE = `
  Usage
    $ host-pinger [alias@]host, [[alias@]host...]

  Options
    -a, --amount Amount of pings. Infinitely (0) by default;
    -d, --delay Delay in ms. 1000 by Default;
    -h, --help Get help;

  Examples
    host-pinger Home@192.168.1.1 62.117.4.217 -a 20 -d 1000
`;

module.exports = {

  HOST_TYPE_ERR    : 'Host can be only string or object',
  BAD_HOST_NAME_ERR: 'Bad host name or ip address',
  PING             : 'ping',
  ERR              : 'error',

  NO_ARGUMENTS_ERR: 'You need at least one host. See host-pinger -h for help',
  HELP: 'help',
  AMOUNT: 'amount',
  DELAY: 'delay',
  USAGE: USAGE

};