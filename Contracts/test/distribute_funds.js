const truffleAssert = require('truffle-assertions');
const Router = artifacts.require("Router");

contract("Distributing funds", function(accounts) {

  it("Owner should be able distribute funds to the shareholders.", async () => {

    // Const
    const ownerAddress = accounts[0];
    const senderAddress = accounts[1];
    const shareHolderAddress1 = accounts[2]
    const shareHolderAddress2 = accounts[3]
    const shareHolderAddress3 = accounts[4]

    const router = await Router.deployed()

    // Add 3 shareholders to the contract
    let share1 = web3.utils.toBN(1000);
    let share2 = web3.utils.toBN(1500);
    let share3 = web3.utils.toBN(4000);
    await router.setShareHolder(shareHolderAddress1, share1, {from: ownerAddress});
    await router.setShareHolder(shareHolderAddress2, share2, {from: ownerAddress});
    await router.setShareHolder(shareHolderAddress3, share3, {from: ownerAddress});

    // Assure distribution fails if not the owner
    await truffleAssert.reverts(router.distributeFunds({from: shareHolderAddress1}), "Only owner has access to this function")

    // Store current balances
    let ownerBalance = web3.utils.toBN(await web3.eth.getBalance(ownerAddress))
    let shareHolder1Balance = web3.utils.toBN(await web3.eth.getBalance(shareHolderAddress1))
    let shareHolder2Balance = web3.utils.toBN(await web3.eth.getBalance(shareHolderAddress2))
    let shareHolder3Balance = web3.utils.toBN(await web3.eth.getBalance(shareHolderAddress3))


    // Sent ETH to the contract from senderAddress
    let amountToSpend = web3.utils.toWei("10","ether")
    await web3.eth.sendTransaction({value: amountToSpend,
                                  from: senderAddress,
                                  to: router.address});

    
    // Check if the amount was received correctly
    let routerBalance = await web3.eth.getBalance(router.address);
    assert.equal(amountToSpend, routerBalance, "Funds were not received properly");

    // Distribute the funds as owner
    receipt = await router.distributeFunds({from: ownerAddress})
    
    // Obtain gas used from the receipt
    let gasUsed = web3.utils.toBN(receipt.receipt.gasUsed);

    // Obtain gasPrice from the transaction
    let tx = await web3.eth.getTransaction(receipt.tx);
    let gasPrice = web3.utils.toBN(tx.gasPrice);
    
    // Check if all shareholders received their share (old balance + share of contract funds should equal new balance)
    assert.equal((shareHolder1Balance.add(web3.utils.toBN(amountToSpend).mul(share1).div(web3.utils.toBN(10000)))).toString(),
                web3.utils.toBN(await web3.eth.getBalance(shareHolderAddress1)).toString(),
                "The shareholder did not receive his share")
    assert.equal((shareHolder2Balance.add(web3.utils.toBN(amountToSpend).mul(share2).div(web3.utils.toBN(10000)))).toString(),
                web3.utils.toBN(await web3.eth.getBalance(shareHolderAddress2)).toString(),
                "The shareholder did not receive his share")
    assert.equal((shareHolder3Balance.add(web3.utils.toBN(amountToSpend).mul(share3).div(web3.utils.toBN(10000)))).toString(),
                web3.utils.toBN(await web3.eth.getBalance(shareHolderAddress3)).toString(),
                "The shareholder did not receive his share")

    // Check if the owner receives the remaining funds
    // The old balance + funds not payed to shareholders - gas costs should equal the new balance)
    console.log(((web3.utils.toBN(10000).sub(share1.add(share2).add(share3)))).toString())
    console.log(((web3.utils.toBN(10000).sub(share1.add(share2).add(share3))).div(web3.utils.toBN(10000))).toString())
    assert.equal((ownerBalance.add(web3.utils.toBN(amountToSpend)
                .mul(web3.utils.toBN(10000).sub(share1.add(share2).add(share3))).div(web3.utils.toBN(10000)))
                .sub(gasPrice.mul(gasUsed))).toString(),
                web3.utils.toBN(await web3.eth.getBalance(ownerAddress)).toString(),
                "Owner balace shoud have increased with the funds minus the gas cost.")

  });

});
