const Command = require('./command')

const Commands = function (params) {
  this.state = params.state
  this.send = params.send
  this.openCommands = []
}

Commands.prototype.create = function (params) {
    const clientMsgId = params.clientMsgId
    const payload = params.payload
    const openCommands = this.openCommands
    const state = this.state
    const command = new Command({
      clientMsgId: clientMsgId,
    })

    if (state.isConnected()) {
      openCommands.push(command)
      send(payload)
    } else {
      command.fail()
    }

    return command.promise
}

Commands.prototype.extract = function (clientMsgId) {
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

Commands.prototype.fail = function () {
  const openCommands = this.openCommands
  for (let i = 0; i < openCommands.length; i += 1) {
    openCommands.pop().fail()
  }
}

module.exports = Commands
