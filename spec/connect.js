const ProtoMessages = require('connect-protobuf-messages')
const AdapterTLS = require('connect-js-adapter-tls')
const EncodeDecode = require('connect-js-encode-decode')
const createCodec = require('connect-js-codec')
const Connect = require('../lib/connect')
const state = require('../lib/state')
const ping = require('./tools/ping')
const subscribeForSpots = require('./tools/subscribe_for_spots')
const createOrder = require('./tools/create_order')

describe('Connect', function () {
  let adapter
  let connect
  let protoMessages
  let codec

  beforeAll(function () {
    adapter = new AdapterTLS({
      host: 'sandbox-tradeapi.spotware.com',
      port: 5032,
    })

    const encodeDecode = new EncodeDecode()

    protoMessages = new ProtoMessages([
      {
        file: 'node_modules/connect-protobuf-messages/src/main/protobuf/CommonMessages.proto',
        protoPayloadType: 'ProtoPayloadType',
      },
      {
        file: 'node_modules/connect-protobuf-messages/src/main/protobuf/OpenApiMessages.proto',
        protoPayloadType: 'ProtoOAPayloadType',
      },
    ])

    codec = createCodec(adapter, encodeDecode, protoMessages)

    connect = new Connect({
      adapter: adapter,
      codec: codec,
    })
  })

  it('loadProto', function () {
    protoMessages.load()
    protoMessages.build()

    const ProtoMessage = protoMessages.getMessageByName('ProtoMessage')
    const protoMessage = new ProtoMessage({
      payloadType: 1,
    })
    expect(protoMessage.payloadType).toBe(1)
  })

  it('onConnect', function (done) {
    adapter.onOpen(done)
    adapter.connect()
  })

  it('ping', function (done) {
    const payloadType = 52
    const payload = {
      timestamp: Date.now(),
    }

    connect.sendGuaranteedCommand(payloadType, payload).then(function (payload) {
      expect(payload.timestamp).toBeDefined()
      done()
    })
  })

  it('auth', function (done) {
    const payloadType = protoMessages.getPayloadTypeByName('ProtoOAAuthReq')
    const payload = {
      clientId: '7_5az7pj935owsss8kgokcco84wc8osk0g0gksow0ow4s4ocwwgc',
      clientSecret: '49p1ynqfy7c4sw84gwoogwwsk8cocg8ow8gc8o80c0ws448cs4',
    }

    connect.sendGuaranteedCommand(payloadType, payload).then(done)
  })

  xit('subscribeForSpots', function (done) {
    subscribeForSpots.call(connect, {
      accountId: 62002,
      accessToken: 'test002_access_token',
      symblolName: 'EURUSD',
    }).then(function (d) {
      console.log('subFSpot: ')
      console.dir(d)
    })
  })

  it('onError', function () {
    const adapter = connect.adapter
    adapter._onError = function () {
      expect(connect.state).toBe(state.disconnected)
    }
    adapter.send(new Buffer(0))
  })

  xit('createOrder', function (done) {
    createOrder.call(connect, {
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
