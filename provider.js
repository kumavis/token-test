var ethUtil = require('ethereumjs-util')
var Transaction = require('ethereumjs-tx')
var ProviderEngine = require('web3-provider-engine')
var FixtureProvider = require('web3-provider-engine/subproviders/fixture.js')
var FilterSubprovider = require('web3-provider-engine/subproviders/filters.js')
var WalletSubprovider = require('web3-provider-engine/subproviders/hooked-wallet.js')
var Manager = require('ethereumjs-testrpc/lib/manager.js')

module.exports = createEngine

function createEngine(){

  var engine = new ProviderEngine()
  engine.setMaxListeners(100)

  // setup keys
  var privateKey = new Buffer('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex')
  var senderAddress = '0x'+ethUtil.privateToAddress(privateKey).toString('hex')

  // logger
  engine.addProvider(new FixtureProvider({
    eth_sendTransaction: function(payload, next, end){
      console.log('GIVEN TX PARAMS:\n', payload.params[0])
      next()
    },
    eth_gasPrice: function(payload, next, end){
      next(function(err, result, cb){
        console.log('gasPrice?:', result)
        cb()
      })
    },
  }))
  
  // sign transactions
  engine.addProvider(new WalletSubprovider({
    getAccounts: function(cb){
      cb(null, [senderAddress])
    },
    signTransaction: function(fullTxData, cb){
      console.log('FINAL TX PARAMS:\n', fullTxData)
      var tx = new Transaction(fullTxData)
      tx.sign(privateKey)
      var rawTx = '0x'+tx.serialize().toString('hex')
      cb(null, rawTx)
    },
  }))

  // test rpc
  engine.addProvider(new FilterSubprovider())
  var manager = new Manager(console, {})
  manager.initialize()
  engine.addProvider(manager)

  // ready
  engine.start()
  return engine

}