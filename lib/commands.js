const Command = require('./command')
const extract = require('./extract')

const Commands = function (params) {
  this.state = params.state
  this.send = params.send
  this.openCommands = []
}

Commands.prototype.create = function ({ clientMsgId, payload }) {
    const command = new Command({
      clientMsgId: clientMsgId,
    })

    if (this.state.isConnected()) {
      this.openCommands.push(command)
      this.send(payload)
    } else {
      command.fail()
    }

    return command.promise
}

Commands.prototype.extract = function (clientMsgId) {
  return extract(this.openCommands, 'clientMsgId', clientMsgId)
}

Commands.prototype.fail = function () {
  while (this.openCommands.length > 0) {
    this.openCommands.pop().fail()
  }
}

module.exports = Commands
