const truffleAssert = require('truffle-assertions');
const Router = artifacts.require("Router");

contract("Withdrawling funds", function(accounts) {

  it("Owner should be able withdrawl all funds.", async () => {

    // Const
    const ownerAddress = accounts[0];
    const senderAddress = accounts[1];
    const otherAddress = accounts[2]
    const router = await Router.deployed()

    // Sent 10 ETH to the contract from senderAddress
    let amountToSpend = web3.utils.toWei("10","ether")
    await web3.eth.sendTransaction({value: amountToSpend,
                                  from: senderAddress,
                                  to: router.address});

    
    // Check if the amount was received correctly
    let routerBalance = await web3.eth.getBalance(router.address);
    assert.equal(amountToSpend, routerBalance, "Funds were not received properly");

    // Assure withdrawl fails if not the owner
    await truffleAssert.reverts(router.withdrawlAllFunds({from: otherAddress}), "Only owner has access to this function")

    // Store current owner balance
    let ownerBalance = web3.utils.toBN(await web3.eth.getBalance(ownerAddress))

    // Withrawl the funds as owner
    withdrawlReceipt = await router.withdrawlAllFunds({from: ownerAddress})
    
    // Obtain gas used from the receipt
    let gasUsed = web3.utils.toBN(withdrawlReceipt.receipt.gasUsed);

    // Obtain gasPrice from the transaction
    let tx = await web3.eth.getTransaction(withdrawlReceipt.tx);
    let gasPrice = web3.utils.toBN(tx.gasPrice);
    
    // Check if the owner receives all funds
    // The old balance + funds received from the contract should equal the new balance + gas costs)
    assert.equal(web3.utils.toBN(amountToSpend).add(ownerBalance).toString(),
                web3.utils.toBN(await web3.eth.getBalance(ownerAddress)).add(gasPrice.mul(gasUsed)).toString(),
                "Owner balace shoud have increased with the funds minus the gas cost.")

  });

});
