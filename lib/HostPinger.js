'use strict';

const EventEmitter = require('events').EventEmitter;
const dns          = require('mz/dns');
const ping         = require('net-ping');

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
      this.emit('error', err);
      this.session.close();
    });
  }

  getServers() {
    let servers = [];

    this.hosts.forEach(host => {

      if (typeof host !== 'string') {
        if (host && (typeof host.host !== 'string')) {
          throw new Error('Host can be only string or object');
        }
      }

      let server = dns.lookup(host.host || host)
        .then(address => {
          let server = {hostName: host.host || host, address: address[0]};

          if (host && host.alias) server.alias = host.alias;
          return server;
        }, err => {
          let server = {
            hostName: host.host || host,
            error: err,
            ping: 'Bad host name or ip address'
          };
          if (host && host.alias) server.alias = host.alias;
          err.server = server;
          this.emit('error', err);
          return server;
        });
      servers.push(server);
    });

    return Promise.all(servers)
      .then(servers => this.servers = servers);
  }

  getPings() {

    let pingedServers = [];

    this.servers.forEach(server => {
      if (!server.error) {
        pingedServers.push(this.pingAddr(server));
      } else {
        pingedServers.push(server);
      }
    });

    return Promise.all(pingedServers)
      .then(servers => {
        return Object.assign(this.servers, servers);
      });
  }

  pingAddr(server) {
    return new Promise((resolve, reject) => {
      this.session.pingHost(server.address, (err, target, sent, rcvd) => {
        if (err) return reject(err);
        resolve(rcvd - sent);
      });
    })
      .then(ping => {
        server.ping = ping;
        return server;
      })
      .catch(err => {
        this.emit('error', err);
        server.ping = err.message;
        err.server = server;
        return server;
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
      .then(() => this.emit('ping', this.servers))
      .catch(err => this.emit('error', err));

    let interval = setInterval(() => {
      if ((this.amount !== 0) && (this.counter >= this.amount)) {
        interval.unref();
        this.session.close();
      }

      if (this.hosts.length > this.servers.length) {
        this.getServers().catch(err => this.emit('error', err));
      }

      this.counter++;
      this.getPings()
        .then(() => this.emit('ping', this.servers))
        .catch(err => this.emit('error', err));

    }, this.delay);

    return this;

  }

}

module.exports = HostPinger;