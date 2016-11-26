'use strict';

const EventEmitter = require('events').EventEmitter;
const dns = require('mz/dns');
const ping = require('net-ping');

const {HOST_TYPE_ERR, BAD_HOST_NAME_ERR, PING, ERR} = require('./constants');

class HostPinger extends EventEmitter {

  constructor({amount = 0, delay = 1000, hosts}) {
    super();
    this.amount = amount;
    this.delay = delay;
    this.hosts = hosts;
    this.stopped = true;

    this.session = ping.createSession();

    this.hosts.forEach(host => {
      if (typeof host !== 'string') {
        if (host && (typeof host.host !== 'string')) {
          throw new Error(HOST_TYPE_ERR);
        }
      }
    });

    this.session.on(ERR, err => {
      this.emit(ERR, err);
      this.session.close();
    });
  }

  resolveHosts() {
    return Promise.all(this.hosts.map(h => this.resolveHost(h)))
      .then(servers => this.servers = servers);
  }

  resolveHost(host) {
    return dns.lookup(host.host || host)
      .then(address => {
        const server = {address: address[0]};
        server.hostName = host.host || host;
        if (host && host.alias) server.alias = host.alias;
        return server;
      })
      .catch(err => {
        const server = {error: err, ping: BAD_HOST_NAME_ERR};
        server.hostName = host.host || host;
        if (host && host.alias) server.alias = host.alias;
        err.server = server;
        this.emit(ERR, err);
        return server;
      });
  }

  getPings() {
    return Promise.all(this.servers.map(server => {
      if (server.error) return server;
      return this.pingAddr(server);
    }))
      .then(servers => Object.assign(this.servers, servers));
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
        this.emit(ERR, err);
        server.ping = err.message;
        err.server = server;
        return server;
      });
  }

  addHost(host) {
    this.hosts.push(host);
    return this;
  }

  stop() {
    this.stopped = true;
    if (this.cb) this.removeListener(PING, this.cb);
    return this;
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  doPing() {
    if (!this.isInfinitely && (this.counter >= this.amount) || this.stopped) {
      return this.session.close();
    }

    let promise = Promise.resolve();

    if (this.servers && this.hosts.length > this.servers.length) {
      promise = promise
        .then(() => this.resolveHosts().catch(err => this.emit(ERR, err)));
    }

    if (!this.isInfinitely) this.counter++;

    return promise
      .then(() => this.getPings())
      .then(() => this.emit(PING, this.servers))
      .catch(err => this.emit(ERR, err))
      .then(() => this.wait(this.delay))
      .then(() => this.doPing());
  }

  start(cb) {

    if (!this.stopped) return;
    this.isInfinitely = this.amount === 0;
    this.counter = 0;
    this.stopped = false;
    if (cb) this.cb = cb;
    if (this.cb) this.on(PING, this.cb);

    this.resolveHosts()
      .then(() => this.doPing());

    return this;

  }

}

module.exports = HostPinger;