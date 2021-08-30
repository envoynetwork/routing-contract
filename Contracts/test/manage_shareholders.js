const truffleAssert = require('truffle-assertions');
const Router = artifacts.require("Router");

contract("Manage share holders", function(accounts) {

  it("Owner should be able to manage the shareholders.", async () => {

    // Const
    const ownerAddress = accounts[0];
    const senderAddress = accounts[1];
    const shareHolderAddress1 = accounts[2]
    const shareHolderAddress2 = accounts[3]
    const shareHolderAddress3 = accounts[4]

    const router = await Router.deployed()

    
    // Assure adjusting shareholders fails if not the owner
    await truffleAssert.reverts(router.setShareHolder(shareHolderAddress1, 1000, {from: shareHolderAddress1}),
      "Only owner has access to this function")

    // Assure distributing at most 100% of the funds are distributed to shareholders
    await truffleAssert.reverts(router.setShareHolder(shareHolderAddress1, 10001, {from: ownerAddress}),
      "The sum of distribution keys cannot be bigger than 100%.")

    // Set new shareholders as owner
    // Shareholder 1: check if everything is set correctly
    await router.setShareHolder(shareHolderAddress1, 1000, {from: ownerAddress})
    assert.equal((await router.distributionKey.call(shareHolderAddress1)).basePoint, 1000,
      "Basepoints for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress1))._index, 0,
      "Array index for the shareholder not set correctly")
    assert.equal(await router._shareHolders.call(0), shareHolderAddress1,
      "Shareholder not found on expecting index")
    assert.equal(await router._totalBasePoints.call(), 1000,
      "The sum of all shareholder basepoints is not what is expected")
    await truffleAssert.reverts(router._shareHolders.call(1))
    
    // Shareholder 2:
    await router.setShareHolder(shareHolderAddress2, 1500, {from: ownerAddress})
    assert.equal((await router.distributionKey.call(shareHolderAddress1)).basePoint, 1000,
      "Basepoints for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress2)).basePoint, 1500,
      "Basepoints for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress1))._index, 0,
      "Array index for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress2))._index, 1,
      "Array index for the shareholder not set correctly")
    assert.equal(await router._shareHolders.call(0), shareHolderAddress1,
      "Shareholder not found on expecting index")
    assert.equal(await router._shareHolders.call(1), shareHolderAddress2,
      "Shareholder not found on expecting index")
    assert.equal(await router._totalBasePoints.call(), 2500,
    "The sum of all shareholder basepoints is not what is expected")
    await truffleAssert.reverts(router._shareHolders.call(2))

    // Shareholder 3:
    await router.setShareHolder(shareHolderAddress3, 4000, {from: ownerAddress})
    assert.equal((await router.distributionKey.call(shareHolderAddress1)).basePoint, 1000,
      "Basepoints for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress2)).basePoint, 1500,
      "Basepoints for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress3)).basePoint, 4000,
      "Basepoints for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress1))._index, 0,
      "Array index for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress2))._index, 1,
      "Array index for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress3))._index, 2,
      "Array index for the shareholder not set correctly")
    assert.equal(await router._shareHolders.call(0), shareHolderAddress1,
      "Shareholder not found on expecting index")
    assert.equal(await router._shareHolders.call(1), shareHolderAddress2,
      "Shareholder not found on expecting index")
    assert.equal(await router._shareHolders.call(2), shareHolderAddress3,
      "Shareholder not found on expecting index")
    assert.equal(await router._totalBasePoints.call(), 6500,
      "The sum of all shareholder basepoints is not what is expected")
    await truffleAssert.reverts(router._shareHolders.call(3))

    // Remove shareholder 2 (with index!=0) by setting share to 0
    await router.setShareHolder(shareHolderAddress2, 0, {from: ownerAddress})
    assert.equal((await router.distributionKey.call(shareHolderAddress1)).basePoint, 1000,
      "Basepoints for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress2)).basePoint, 0,
      "Basepoints for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress3)).basePoint, 4000,
      "Basepoints for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress1))._index, 0,
      "Array index for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress2))._index, 0,
      "Array index for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress3))._index, 1,
      "Array index for the shareholder not set correctly")
    assert.equal(await router._shareHolders.call(0), shareHolderAddress1,
      "Shareholder not found on expecting index")
    assert.equal(await router._shareHolders.call(1), shareHolderAddress3,
      "Shareholder not found on expecting index")
    assert.equal(await router._totalBasePoints.call(), 5000,
      "The sum of all shareholder basepoints is not what is expected")
    await truffleAssert.reverts(router._shareHolders.call(2))


    // Remove shareholder 1 (with index==0) by setting share to 0
    await router.setShareHolder(shareHolderAddress1, 0, {from: ownerAddress})
    assert.equal((await router.distributionKey.call(shareHolderAddress1)).basePoint, 0,
      "Basepoints for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress2)).basePoint, 0,
      "Basepoints for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress3)).basePoint, 4000,
      "Basepoints for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress1))._index, 0,
      "Array index for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress2))._index, 0,
      "Array index for the shareholder not set correctly")
    assert.equal((await router.distributionKey.call(shareHolderAddress3))._index, 0,
      "Array index for the shareholder not set correctly")
    assert.equal(await router._shareHolders.call(0), shareHolderAddress3,
      "Shareholder not found on expecting index")
    assert.equal(await router._totalBasePoints.call(), 4000,
      "The sum of all shareholder basepoints is not what is expected")
    await truffleAssert.reverts(router._shareHolders.call(1))

  });

});
