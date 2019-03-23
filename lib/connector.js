const EventEmitter = require('events')
const hat = require('hat')
const util = require('util')

const Commands = require('./commands')
const GuaranteedCommands = require('./guaranteed_commands')
const State = require('./state')

const Connector = function ({ adapter, codec }) {
  EventEmitter.call(this)

  this.adapter = adapter
  this.codec = codec

  this.init()
}

util.inherits(Connector, EventEmitter)

Connector.prototype.init = function () {
  const state = new State()
  const send = this.adapter.send.bind(this.adapter)

  this.onConnect()
  this.onEnd()

  this.state = state
  
  this.guaranteedCommands = new GuaranteedCommands({
    state,
    send,
  })
  
  this.commands = new Commands({
    state,
    send,
  })
  
  this.codec.subscribe(
    this.onMessage.bind(this)
  )
}

Connector.prototype.connect = function (config) {
  this.adapter.connect(config)
}

Connector.prototype.onConnect = function (callback) {
  this.adapter.onOpen(() => {
    this.state.connected()
    this.guaranteedCommands.resend()
    
    if (callback) {
      callback()
    }
  })
}

Connector.prototype.sendGuaranteedCommand = function (payload_type, payload) {
  const client_msg_id = hat()
  // TODO: ERROR: payload is sometimes `Buffer`, sometimes `{ payload_type, payload, client_msg_id }`
  const message = { payloadType: payload_type, payload, clientMsgId: client_msg_id }

  return this.guaranteedCommands.create({
    payload: message,
    clientMsgId: client_msg_id,
  })
}

Connector.prototype.sendCommand = function (payloadType, payload) {
  const clientMsgId = hat()
  // TODO: ERROR: data is sometimes `Buffer`, sometimes `{ payloadType, payload, clientMsgId }`
  const message = { payloadType: payload_type, payload, clientMsgId: client_msg_id }

  return this.commands.create({
    payload: message,
    clientMsgId: clientMsgId,
  })
}

Connector.prototype.onMessage = function (payloadType, payload, clientMsgId) {
  clientMsgId
    ? this.processData(clientMsgId, payloadType, payload)
    : this.processPushEvent(payload, payloadType)
}

Connector.prototype.processData = function (clientMsgId, payloadType, payload) {
  const command = this.extractCommand(clientMsgId)

  command
    ? this.processMessage(command, payload, payloadType)
    : this.processPushEvent(payload, payloadType)
}

Connector.prototype.extractCommand = function (clientMsgId) {
  return this.guaranteedCommands.extract(clientMsgId) || this.commands.extract(clientMsgId)
}

Connector.prototype.processMessage = function (command, payload, payloadType) {
  this.isError(payloadType)
    ? command.fail(payload)
    : command.done(payload)
}

Connector.prototype.processPushEvent = function (payload, payloadType) {
  this.emit(payloadType, payload)
}

Connector.prototype.onEnd = function (callback) {
  this.adapter.onEnd(() => {
    this.state.disconnected()
    this.commands.fail()
    
    if (callback) {
      callback()
    }
  })
}

Connector.prototype.isError = function (isErrorpayloadType) {
  //Overwrite this method by your buisness logic
  return false
}

module.exports = Connector
