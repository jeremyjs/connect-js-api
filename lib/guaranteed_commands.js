const GuaranteedCommand = require('./guaranteed_command')

const GuaranteedCommands = function (params) {
  this.state = params.state
  this.send = params.send
  this.openCommands = []
}

GuaranteedCommands.prototype.create = function (params) {
  const command = new GuaranteedCommand(params)
  const send = this.send

  this.openCommands.push(command)

  if (this.state.isConnected()) {
    send(command.payload)
  }

  return command.promise
}

GuaranteedCommands.prototype.resend = function () {
  this.openCommands.forEach(function (command) {
    this.send(command.payload)
  }, this)
}

GuaranteedCommands.prototype.extract = function (clientMsgId) {
  const openCommands = this.openCommands
  const openCommandsLength = openCommands.length
  let command
  let index = 0
  while (index < openCommandsLength) {
    command = openCommands[index]
    if (command.clientMsgId === clientMsgId) {
      openCommands.splice(index, 1)
      return command
    }
    index += 1
  }
}

module.exports = GuaranteedCommands
