const createAdapter = require('connect-js-adapter-tls')
const { Codec, codec: createCodec } = require('connect-js-codec')
const EncodeDecode = require('connect-js-encode-decode')
const ProtoMessages = require('connect-protobuf-messages')

const Connector = require('../lib/connector')
const state = require('../lib/state')
// const ping = require('./tools/ping')
const createOrder = require('./tools/create_order')

const { host, port } = require('./config')

describe('Connector', function () {
  let adapter
  let codec
  let connector
  let encodeDecode
  let protocol

  beforeAll(function () {
    encodeDecode = new EncodeDecode()

    protocol = new ProtoMessages([
      { file: 'CommonMessages.proto'  },
      { file: 'OpenApiMessages.proto' },
    ])

    codec = new Codec(encodeDecode, protocol)
    
    adapter = createAdapter(codec)

    connector = new Connector({
      adapter,
      codec,
    })
    
    connector.connect({ host, port })
  })

  it('loadProto', function () {
    protocol.load()
    protocol.build()

    const ProtoMessage = protocol.getMessageByName('ProtoMessage')
    const protoMessage = new ProtoMessage({
      payloadType: 1,
    })
    
    expect(protoMessage.payloadType).toBe(1)
  })

  it('onConnect', function (done) {
    connector.onConnect(done)
  })

  it('gets version', function (done) {
    const payload_type = 2104

    connector.sendGuaranteedCommand(payload_type, {})
    .then(function (response) {
      expect(response.version).toBe('60')
      done()
    })
    .catch(() => done())
  })

  it('auth application', function (done) {
    const payload_type = protocol.getPayloadTypeByName('ProtoOAApplicationAuthReq')
    const payload = {
      clientId: '7_5az7pj935owsss8kgokcco84wc8osk0g0gksow0ow4s4ocwwgc',
      clientSecret: '49p1ynqfy7c4sw84gwoogwwsk8cocg8ow8gc8o80c0ws448cs4',
    }

    connector.sendGuaranteedCommand(payload_type, payload)
    .then(function (response) {
      expect(response.payloadType).toBe(2101)
      done()
    })
    .catch(() => done())
  })

  xit('auth account', function (done) {
    const payload_type = protocol.getPayloadTypeByName('ProtoOAAccountAuthReq')
    const payload = {
      ctidTraderAccountId: 89214,
      accessToken: 'test004_access_token',
    }

    connector.sendGuaranteedCommand(payload_type, payload)
    .then(function (response) {
      console.log(response)
      console.log(response.ctidTraderAccountId.toString())
      expect(response.payloadType).toBe(0)
      done()
    })
    .catch(() => done())
  })

  xit('subscribeForSpots', function (done) {
    const payload_type = protocol.getPayloadTypeByName('ProtoOASubscribeSpotsReq')
  
    connector.sendGuaranteedCommand(payload_type, {
      ctidTraderAccountId: 89214,
      symbolId: 'EURUSD',
    })
    .then(function (response) {
      console.log(response)
      console.log(response.ctidTraderAccountId.toString())
      done()
    })
    .catch(() => done())
  })

  xit('onError', function () {
    const adapter = connector.adapter
    adapter._onError = function () {
      expect(connector.state).toBe(state.disconnected)
    }
    adapter.send(new Buffer(0))
  })

  xit('createOrder', function (done) {
    createOrder.call(connector, {
      accountId: 62002,
      accessToken: 'test002_access_token',
      symbolName: 'EURUSD',
      orderType: 1,
      tradeSide: 1,
      volume: 5699999.999999999,
      clientOrderId: '1691',
      comment: '1691',
    }).then(function (respond) {
      done()
    })
  })
})
