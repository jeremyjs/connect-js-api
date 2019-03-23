const { Codec } = require('connect-js-codec')

var TextMessages = require('./tools/text_messages')
var createAdapter = require('./tools/adapter_websocket')
var TextEncodeDecode = require('./tools/text_encode_decode')
var Connector = require('../lib/connector')

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000

xdescribe('WebSocket with text stream and json protocol', function () {
  var connector

  beforeAll(function () {
    const adapter = createAdapter()
    const textEncodeDecode = new TextEncodeDecode()
    const textMessages = new TextMessages()
    const codec = new Codec(textEncodeDecode, textMessages)

    connector = new Connector({
      adapter,
      codec,
    })

    connector.connect({ url: 'wss://x3.p.ctrader.com:5030' })
  })

  xit('ping', function (done) {
    connector.sendGuaranteedCommand(52, {
      timestamp: Date.now()
    })
    .then(function (respond) {
      expect(respond.timestamp).toBeDefined()
      done()
    })
    .catch(() => done())
  })
})
