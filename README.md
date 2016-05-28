# Host pinger

> Ping your multiple hosts in realtime from the CLI or use it as Node.js module.

## CLI

### Install

```
npm install --global host-pinger
```

### Usage

```
$ host-pinger --help

   Usage
     $ host-pinger [alias@]host, [[alias@]host...]

   Options
     -a, --amount Amount of pings. Infinitely (0) by default;
     -d, --delay Delay in ms. 1000 by Default;
     -h, --help Get help;

   Examples
    host-pinger Home@192.168.1.1 google.com -a 20 -d 1000
```

## Node.js Module

### Install

```
npm install --save host-pinger
```

### Usage

```
const HostPinger = require('host-pinger');

let hostPinger = new HostPinger({
  hosts: [
    {alias: 'Home', host: '192.168.1.1'},
    'google.com'
  ]
});

//Get pings
hostPinger.start(servers => {
  //...
});


//Error handling
hostPinger.on('error', err => {
  //...
});
```

### Server response structure

```
{ hostName: 'google.com',
 address: '92.223.8.109',
 ping: 10 }
```

