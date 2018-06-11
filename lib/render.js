const chalk = require("chalk")
const logUpdate = require("log-update")
const os = require("os")

function makeTemplate(s) {
  let str = `* ${s.alias || s.hostName}: `

  switch (true) {
    case s.ping < 50:
      str += chalk.green(s.ping)
      break

    case s.ping >= 50 && s.ping <= 100:
      str += chalk.yellow(s.ping)
      break

    default:
      str += chalk.red(s.ping)
      break
  }

  return str
}

function render(servers) {
  const template = servers.map(makeTemplate)
  logUpdate(template.join(os.EOL))
}

module.exports = render
