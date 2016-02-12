const solc = require('solc')
const Web3 = require('web3')
const TestProvider = require('ethereumjs-testrpc').provider
const fs = require('fs')
const tokenSource = fs.readFileSync('./token.sol', 'utf8')
const standardSource = fs.readFileSync('./standard.sol', 'utf8')

var engine = TestProvider()
engine.on('block', function(block){
  console.log('BLOCK:', '0x'+block.number.toString('hex'))
})

var web3 = new Web3(engine)

var filter = web3.eth.filter('pending');

// // log txs
// filter.watch(function (error, log) {
//   console.log(arguments)
//   console.log('FILTER:', log)
// });

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

var ST = web3.eth.contract(Standard_Token.abi)

var amount = 1000

web3.eth.getAccounts(function(err, accounts){
  var addr = accounts[0];
  ST.new(amount, {from: addr, data: Standard_Token.bytecode, gas: 3100000}, function(err, result) {
    if (err) return console.error(err)
    if (!result.address) return

    console.log('address:', result.address)
    web3.eth.getCode(result.address, function(err, result){
      console.log('code:', result)
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

// function onTxReady(txHash, cb){
//   var didFinish = false
//   var intervalId = setInterval(function(){
//     web3.eth.getTransactionReceipt(txHash, function(err, txReceipt){
//       if (didFinish) return
//       if (err) return console.error(err)
//       if (txReceipt.blockHash) {
//         didFinish = true
//         clearInterval(intervalId)
//         cb(null, txReceipt)
//       }
//     })
//   }, 500)
// }