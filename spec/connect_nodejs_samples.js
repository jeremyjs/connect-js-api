const createAdapter = require('connect-js-adapter-tls')
const { Codec } = require('connect-js-codec')
const EncodeDecode = require('connect-js-encode-decode')
const OpenApiProtocol = require('open-api-protocol')

const Connector = require('../lib/connector')

// const ping = require('./tools/ping')

const { host, port } = require('./config')

describe('connect-nodejs-sample', function () {
  let adapter, connect, protocol

  beforeAll(function () {
    const encodeDecode = new EncodeDecode()
    
    protocol = new OpenApiProtocol()

    const codec = new Codec(encodeDecode, protocol)

    adapter = createAdapter(codec)

    connector = new Connector({
      adapter,
      codec,
    })
  })

  xit('ping & auth & stops', function (done) {
    protocol.load()
    protocol.build()

    connector.onConnect(function () {
      setInterval(function () {
        connector.sendGuaranteedCommand(
          protocol.getPayloadTypeByName('ProtoHeartbeatEvent')
        ).then(console.log)
      }, 1000)
      
      connector.sendGuaranteedCommand(
        protocol.getPayloadTypeByName('ProtoOAApplicationAuthReq'),
        {
          clientId: '7_5az7pj935owsss8kgokcco84wc8osk0g0gksow0ow4s4ocwwgc',
          clientSecret: '49p1ynqfy7c4sw84gwoogwwsk8cocg8ow8gc8o80c0ws448cs4'
        }
      )
      .then(function (response) {
        console.log(response)
        expect(response.payloadType).toBe(2101)
        connector.sendGuaranteedCommand(
          protocol.getPayloadTypeByName('ProtoOASubscribeSpotsReq'),
          {
            ctidTraderAccountId: 62002,
            // accessToken: 'test002_access_token',
            symbolId: 'EURUSD'
          }
        )
        .then(function (response) {
          console.log(response)
          expect(response.subscriptionId).toBeDefined()
          done()
        })
      })
    })

    connector.connect({ host, port })
  })
})
