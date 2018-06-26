const EventEmitter = require("events").EventEmitter
const dns = require("dns")
const ping = require("net-ping")
const delay = require("delay")
const pify = require("pify")

const lookup = pify(dns.lookup, {
  multiArgs: true,
})

const { HOST_TYPE_ERR, BAD_HOST_NAME_ERR, PING, ERR } = require("./constants")

class HostPinger extends EventEmitter {
  constructor({ amount = 0, delay = 1000, hosts }) {
    super()
    this.amount = amount
    this.delay = delay
    this.hosts = hosts
    this.stopped = true

    this.session = ping.createSession()

    this.session.pingHost = pify(this.session.pingHost, {
      multiArgs: true,
    })

    this.hosts.forEach(host => {
      if (typeof host !== "string") {
        if (host && typeof host.host !== "string") {
          throw new Error(HOST_TYPE_ERR)
        }
      }
    })

    this.session.on(ERR, err => {
      this.emit(ERR, err)
      this.session.close()
    })
  }

  async resolveHosts() {
    this.servers = await Promise.all(this.hosts.map(h => this.resolveHost(h)))
    return this.servers
  }

  async resolveHost(host) {
    try {
      const [address] = await lookup(host.host || host)

      const server = { address }

      server.hostName = host.host || host

      if (host && host.alias) server.alias = host.alias

      return server
    } catch ([err]) {
      const server = { error: err, ping: BAD_HOST_NAME_ERR }

      server.hostName = host.host || host

      if (host && host.alias) server.alias = host.alias

      err.server = server

      this.emit(ERR, err)
      return server
    }
  }

  async getPings() {
    const servers = await Promise.all(
      this.servers.map(server => {
        if (server.error) return server
        return this.pingAddr(server)
      }),
    )

    Object.assign(this.servers, servers)

    return this.servers
  }

  async pingAddr(server) {
    try {
      const [, sent, rcvd] = await this.session.pingHost(server.address)

      const ping = rcvd - sent

      server.ping = ping
    } catch ([err]) {
      this.emit(ERR, err)

      server.ping = err.message

      err.server = server
    } finally {
      return server
    }
  }

  addHost(host) {
    this.hosts.push(host)
    return this
  }

  stop() {
    this.stopped = true
    if (this.cb) this.removeListener(PING, this.cb)
    return this
  }

  async doPing() {
    if ((!this.isInfinitely && this.counter >= this.amount) || this.stopped) {
      return this.session.close()
    }

    if (this.servers && this.hosts.length > this.servers.length) {
      await this.resolveHosts()
    }

    if (!this.isInfinitely) this.counter++

    try {
      await this.getPings()
      this.emit(PING, this.servers)
    } catch (err) {
      this.emit(ERR, err)
    } finally {
      await delay(this.delay)
      this.doPing()
    }
  }

  start(cb) {
    if (!this.stopped) return
    this.isInfinitely = this.amount === 0
    this.counter = 0
    this.stopped = false
    if (cb) this.cb = cb
    if (this.cb) this.on(PING, this.cb)

    this.resolveHosts().then(() => this.doPing())

    return this
  }
}

module.exports = HostPinger
