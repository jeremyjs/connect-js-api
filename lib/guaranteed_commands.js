const extract = require('./extract')
const GuaranteedCommand = require('./guaranteed_command')

const GuaranteedCommands = function (params) {
  this.state = params.state
  this.send = params.send
  this.openCommands = []
}

GuaranteedCommands.prototype.create = function (params) {
  const command = new GuaranteedCommand(params)

  this.openCommands.push(command)

  if (this.state.isConnected()) {
    this.send(command.payload)
  }

  return command.promise
}

GuaranteedCommands.prototype.resend = function () {
  this.openCommands.forEach(function (command) {
    this.send(command.payload)
  }, this)
}

GuaranteedCommands.prototype.extract = function (clientMsgId) {
  return extract(this.openCommands, 'clientMsgId', clientMsgId)
}

module.exports = GuaranteedCommands
