pragma solidity ^0.8.0;


/**
 * @title A routing contract to distribute funds
 * @author Kasper De Blieck
 * @notice This contract will receive funds and distribute them to other shareholder addresses via a distribution key.
 * The contract owner is responsable for setting and updating the shareholders and triggering the payout.
 */
contract Router {
 
    // Struct with shareholder info
    struct ShareHolderStruct{
        uint16 basePoint; //the amount of base points (0.1%, or 0.0001) he owns of incoming funds
        uint16 _index; // _index in the shareholder in the _shareHolders array keeping all shareholders
    }
 
    // Mapping to link a shareholder address to it's data
    mapping(address => ShareHolderStruct) public distributionKey;
  
    // Array to keep track of share holders present
    address payable[] public _shareHolders;
  
    address payable public _contractOwner;
  
    // Used to make sure at most 100% is being routed
    uint16 public _totalBasePoints;
  
    // MODIFIERS
    modifier onlyOwner() {
        require(msg.sender == _contractOwner, "Only owner has access to this function");
        _;
    }
  
    modifier onlyShareHolder() {
        require(distributionKey[msg.sender].basePoint > 0, "Only shareHolders with a share have access to this function");
        _;
    }

  
    // FUNCTIONS
    constructor (){
        _contractOwner = payable(msg.sender);
    }
  
    /**
    * @dev receive and fallback in order to receive Ether on the contract address
    */
    receive() external payable {}
    fallback() external payable {}

    /**
    * @notice Change the contract owner
    * @param owner the address of the new contract owner
    */
    function setContractOwner(address payable owner) external onlyOwner {
        _contractOwner = owner;
    }
  
    /**
    * @notice Function to add, remove or update shareholders.
    * To remove, just set basePoint_ to 0.
    * Before updating the distribution key, the existing balance will be settled
    * @param shareHolder_ address of the new shareHolder
    * @param basePoint_ the share of the shareHolder in basePoint (0.1%)
    */
    function setShareHolder(address payable shareHolder_, uint16 basePoint_) external onlyOwner{
        // Check if the new value does not result in a payout of more than 100%
        require((_totalBasePoints + basePoint_ - distributionKey[shareHolder_].basePoint ) < 10000,
            "The sum of distribution keys cannot be bigger than 100%.");
  
        // If there are still funds left, pay them out before updating the distribution keys
        if (address(this).balance > 0) {
            distributeFunds();
        }
  
        // Update sum of all shareholder basepoints
        _totalBasePoints = _totalBasePoints + basePoint_ - distributionKey[shareHolder_].basePoint;
      
        // Set the share
        distributionKey[shareHolder_].basePoint = basePoint_;
      
        // If the shareholder did not exist, add him to the list of shareholders and save the _index.
        // Check for the edge case the _index in the mapping has default value 0, but is actual the first element in the list
        if ((distributionKey[shareHolder_]._index == uint16(0)) && ((_shareHolders.length == 0) || (shareHolder_ != _shareHolders[0]))){
            distributionKey[shareHolder_]._index = uint16(_shareHolders.length);
            _shareHolders.push(shareHolder_);
        }
        // Else, check if the shareholder needs to be deleted from the shareholder list
        else if (basePoint_ == 0){
        // Order does not mather in the list, overwrite the address-to-delete with the last address
        // and delete the last address to avoid gaps in the array
            _shareHolders[distributionKey[shareHolder_]._index] = _shareHolders[_shareHolders.length-1];
            delete _shareHolders[_shareHolders.length-1];
            distributionKey[shareHolder_]._index = 0;
        }
    }
  
    /**
    * @notice Function for each shareholder to withdrawl his remaining funds from the contract.
    */
    function distributeFunds() public onlyOwner{
        // Keep track of initial share
        uint256 totalShare = address(this).balance;
        // For each shareholder, calculate the share and send it
        for (uint i = 0; i < _shareHolders.length; i++) {
            uint256 share = totalShare * uint256(distributionKey[_shareHolders[i]].basePoint) / 10000;
            _shareHolders[i].transfer(share);
        }
  
        // Send remaining funds to the contract owner
        withDrawlAllFunds();
  
    }
  

    /**
    * @notice Function for the owner to withdrawl all funds from the contract.
    */
    function withDrawlAllFunds() public onlyOwner{
        _contractOwner.transfer(address(this).balance);
    }
 
}
