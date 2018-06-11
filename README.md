# Host pinger
> Ping your multiple hosts in realtime from the CLI or use it as Node.js module.
## CLI
### Install
```javascript
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
```javascript
npm install --save host-pinger
```
### Usage
```javascript
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
//Stop receive pings
hostPinger.stop();
//Error handling
hostPinger.on('error', err => {
//...
});
```
### HostPinger
#### new HostPinger([opts])
Create a new HostPinger.
| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> |  |
| [options.amount] | <code>Number</code> | Amount of pings. Infinitely (0) by default; |
| [options.delay] | <code>Number</code> | Delay in ms. 1000 by Default; |
| [options.hosts] | <code>Array</code> | Array of hosts strings or objects |
### Server response structure
```javascript
{ hostName: 'google.com',
address: '92.223.8.109',
ping: 10 }
```
