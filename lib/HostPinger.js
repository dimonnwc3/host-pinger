'use strict';

const EventEmitter = require('events').EventEmitter;
const dns = require('mz/dns');
const ping = require('net-ping');
const validator = require('validator');
const co = require('co');

class HostPinger extends EventEmitter {
  constructor(options) {
    super();
    this.count = options.count || 5;
    this.delay = options.delay || 1000;
    this.counter = 0;
    this.hosts = options.hosts;
    this.cb = options.cb;
    this.session = ping.createSession();

    this.session.on('error', err => {
      console.error(`error: ${err}`);
      this.session.close();
    });
  }

  *getServers() {
    let servers = [];

    this.hosts.forEach(host => {
      let server = dns.lookup(host.host || host).then(address => {

        if (!validator.isIP(address[0])) throw new Error('Bad IP');

        let server = { hostName: host.host || host, address: address[0] };

        if (host && host.alias) server.alias = host.alias;
        return server;
      });
      servers.push(server);
    });
    this.servers = yield servers;
    return this.servers;
  }

  *getPings() {

    let pingedServers = [];

    this.servers.forEach((server) => {
      pingedServers.push(this.pingAddr(server));
    });

    this.servers = yield pingedServers;
    return this.servers;
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
    
    let self = this;

    co(function*() {
      this.counter++;
      yield* self.getServers();
      yield* self.getPings();
    })
    .then(() => self.emit('ping', null, self.servers))
    .catch(err => {
      self.emit('ping', err, self.servers);
    });

    let interval = setInterval(() => {
      if (this.count !== 0) {
        if (this.counter >= this.count) {
          interval.unref();
          this.session.close();
        }
      }
    
      this.counter++;
    
      co(function*() {
        yield* self.getPings();
      })
      .then(() => self.emit('ping', null, self.servers))
      .catch(err => {
        self.emit('ping', err, self.servers);
      });
    
    }, this.delay);

    if (cb || this.cb) this.on('ping', cb || this.cb);
    return this;

  }

}

module.exports = HostPinger;