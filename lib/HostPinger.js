'use strict';

const EventEmitter = require('events').EventEmitter;
const dns          = require('mz/dns');
const ping         = require('net-ping');
const validator    = require('validator');

const defaultOptions = {
  amount : 0,
  delay  : 1000,
  counter: 0
};

class HostPinger extends EventEmitter {
  constructor(options) {
    super();
    Object.assign(this, defaultOptions, options);
    this.session = ping.createSession();
    this.session.on('error', err => {
      console.error(`error: ${err}`);
      this.session.close();
    });
  }

  getServers() {
    let servers = [];

    this.hosts.forEach(host => {

      if (typeof host !== 'string') {
        if (typeof host.host !== 'string') {
          throw new Error('Host cat be only string or object');
        }
      }

      let server = dns.lookup(host.host || host)
        .then(address => {
          if (!validator.isIP(address[0])) throw new Error('Bad IP');

          let server = {hostName: host.host || host, address: address[0]};

          if (host && host.alias) server.alias = host.alias;
          return server;
        });
      servers.push(server);
    });

    return Promise.all(servers)
      .then(servers => this.servers = servers);
  }

  getPings() {

    let pingedServers = [];

    this.servers.forEach((server) => {
      pingedServers.push(this.pingAddr(server));
    });

    return Promise.all(pingedServers)
      .then(servers => this.servers = servers);
  }

  pingAddr(server) {
    return new Promise((resolve, reject) => {
      this.session.pingHost(server.address, (err, target, sent, rcvd) => {
        if (err) return reject(err);
        server.ping = rcvd - sent;
        resolve(server);
      });
    });
  }

  addHost(host) {
    this.hosts.push(host);
    return this;
  }

  start(cb) {

    if (cb) this.cb = cb;
    if (this.cb) this.on('ping', this.cb);

    this.counter++;

    this.getServers()
      .then(() => this.getPings())
      .then(() => this.emit('ping', null, this.servers))
      .catch(err => {
        this.emit('ping', err, this.servers);
      });

    let interval = setInterval(() => {
      if ((this.amount !== 0) && (this.counter >= this.amount)) {
        interval.unref();
        this.session.close();
      }

      this.counter++;
      this.getPings()
        .then(() => this.emit('ping', null, this.servers))
        .catch(err => {
          this.emit('ping', err, this.servers);
        });

    }, this.delay);

    return this;

  }

}

module.exports = HostPinger;