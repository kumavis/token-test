const solc = require('solc')
const Web3 = require('web3')
const TestProvider = require('./provider.js')
const fs = require('fs')
const tokenSource = fs.readFileSync('./token.sol', 'utf8')
const standardSource = fs.readFileSync('./standard.sol', 'utf8')

var engine = TestProvider()
var web3 = new Web3(engine)

console.log('compiling solidity...')
var compiled = compile({
  sources: {
    'Token': tokenSource,
    'Standard_Token': standardSource,
  },
})

var Standard_Token = {
  abi: JSON.parse(compiled.contracts.Standard_Token.interface),
  bytecode: '0x'+compiled.contracts.Standard_Token.bytecode,
}

var amount = 1000
var ST = web3.eth.contract(Standard_Token.abi)

web3.eth.getAccounts(function(err, accounts){
  var addr = accounts[0];
  ST.new(amount, {from: addr, data: Standard_Token.bytecode, gas: 3100000}, function(err, result) {
    if (err) return console.error(err)
    if (!result.address) return
    web3.eth.getCode(result.address, function(err, result){
      console.log('code:', result)
      engine.stop()
    })
  });
});


function compile(src){
  var output = solc.compile(src, 1); // 1 activates the optimiser

  if (!output || output.errors) {
    return console.error(output)
  }

  return output
}
