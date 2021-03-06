import React, {Component}  from 'react'
import Web3 from 'web3'

import './ConnectWeb3.css';

/**
 * Component to interact to the smart contract via Web3
 */
class ConnectWeb3 extends Component{
    
    /**
     * Sets the initial state
     * @param {*} props Should contain the contract ABI, address and web provider 
     */
    constructor(props){
        super(props)
        this.state = {
            connectedWallet: null,
            connectedNetwork: null,
            web3: null,
            contract: null,
            web3ReadOnly: null,
            contractReadOnly: null,
            contractProperties: {
                balance: 0,
                _contractOwner: '',
                totalShares: 0,
                totalBasePoints: 0,
                shareholdersLength: 0,
                shareholdersData: [],
            },
            formProperties: {
                shareholder: '',
                basepoints: '',
                newOwner: '',
            }
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDistribution = this.handleDistribution.bind(this);
        this.handleWithdrawl = this.handleWithdrawl.bind(this);
        this.handleChangeOwner = this.handleChangeOwner.bind(this);
    }

    /**
     * Handle all the asynchronous calls to the smart contract on Ethereum.
     */
    componentDidMount(){
        let state = this.state

        // Get read version and write version (connected via wallet) of web3
        state.web3 = new Web3(window.ethereum);
        state.contract = new state.web3.eth.Contract(this.props.abiContract, this.props.contractAddress);

        state.web3ReadOnly = new Web3(this.props.webProvider);
        state.contractReadOnly = new state.web3ReadOnly.eth.Contract(this.props.abiContract, this.props.contractAddress);
        console.log(state.contractReadOnly)

        this.setState(state)

        // First we need to check if a Web3 browser extension was found
        if (!window.ethereum) {
            alert("Web3 wallet not found");
        } else {
            this.connectWallet();
        }

        this.getContractProperties()
    }
    
    /**
     * Connect the Ethereum wallet (e.g. Metamask) to the web application.
     */
    async connectWallet(){
        try {
            let state = this.state

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            state.connectedWallet = accounts[0];
            state.connectedNetwork = window.ethereum.networkVersion;

            this.setState(state)

        } catch (error){
            if (error.code === 4001) {
                alert('User rejected the request') // User rejected request
            }
            console.error(error);
        }
    }

    /**
     * Mapping to translate network ID into a name
     * @param {*} networkId number of the network ID to connect to
     * @returns the name of the network to connect to
     */
    getConnectedNetwork(networkId){
        if (networkId === '1'){
            return "Ethereum Mainnet";
        } else if (networkId === "4") {
            return "Rinkeby Testnet";
        } else if (networkId === "5") {
            return "Goerli Testnet";
        } else {
            return "Unknown network - probably local";
        }
    }

    /**
     * Load the smart contract properties and put them into the state under 'contractProperties'
     * Contractowner, total shares and the amount of shareholders are stored directly.
     * Shareholder data is converted to an array of structs containing shareholder address and share in basepoints.
     */
    async getContractProperties(){
        let state = this.state
        state.contractProperties.balance = await state.web3.eth.getBalance(this.props.contractAddress)
        state.contractProperties._contractOwner = await state.contractReadOnly.methods.owner().call()
        state.contractProperties.totalShares = await state.contractReadOnly.methods.totalBasePoints().call()
        state.contractProperties.shareholdersLength = await state.contractReadOnly.methods.getShareholdersLength().call()
        for(let i=0; i < state.contractProperties.shareholdersLength; i++){
            let shareholder = await state.contractReadOnly.methods.shareholders(i).call()
            let shareholderInfo = await state.contractReadOnly.methods.distributionKey(shareholder).call()
            console.log(shareholderInfo)
            shareholderInfo = {shareholder: shareholder, basepoints: shareholderInfo.basePoint}
            console.log(shareholderInfo)

            state.contractProperties.shareholdersData.push(shareholderInfo)
        }
        this.setState(state)
    }

    handleChange(event) {
        let state = this.state
        console.log(event.target)
        state.formProperties[event.target.name] = event.target.value
        this.setState(state);
    }

    async handleSubmit(event) {
        event.preventDefault()
        try{
            let receipt = await this.state.contract.methods.setShareHolder(this.state.formProperties.shareholder, this.state.formProperties.basepoints).send({from: this.state.connectedWallet})
            await receipt
            alert('Transaction mined!');
        }
        catch (error){
            await error
            alert(error)
        }
    }

    async handleDistribution(event) {
        event.preventDefault()
        try{
            let receipt = await this.state.contract.methods.distributeFunds().send({from: this.state.connectedWallet})
            await receipt
            alert('Transaction mined!');
        }
        catch (error){
            await error
            alert(error)
        }        
    }

    async handleWithdrawl(event){
        event.preventDefault()
        try{
            let receipt = await this.state.contract.methods.withdrawlAllFunds().send({from: this.state.connectedWallet})
            await receipt
            alert('Transaction mined!');
        }
        catch (error){
            await error
            alert(error)
        }        
    }

    async handleChangeOwner(event){
        event.preventDefault()
        try{
            let receipt = await this.state.contract.methods.transferOwnership(this.state.formProperties.newOwner).send({from: this.state.connectedWallet})
            await receipt
            alert('Transfered ownership');
        }
        catch (error){
            await error
            alert(error)
        }     
    }

    render() {
        let state = this.state

        return (
        <div>
            <div className='Title'>
                Envoy Router test
            </div>
            <div className='Subtitle'>
                Info
            </div>
            <div>
                This address is used to receive funds with Envoy as a receiver, and to equally devide them between all the relevant shareholders.
                The contract owner can add, update or delete shareholders and define which share they should receive.
                The contract owner can decide to distribute the funds received by the contract over all shareholders.
                If the total amount of shares is lower than 10000BP or 100%, the remaining funds are send to an Envoy wallet.
            </div>
            <div className='Subtitle'>
                Contract and network data
            </div>
            <div>
                <ul>
                    <li>Testing routing contract with address '{this.props.contractAddress}' on network {this.getConnectedNetwork(state.connectedNetwork)}</li>
                    <li>The user connected is '{state.connectedWallet}'.</li>
                    <li>Only the contract owner ('{state.contractProperties._contractOwner}') can modify the contract shareholders or distribute funds.</li>
                </ul>
            </div>
            <div className='Subtitle'>
                Current status
            </div>    
            <div>
                A list of currently registered shareholders (currently {state.contractProperties.shareholdersLength}) is listed below.
                They account for a total share of {state.contractProperties.totalShares/10000}%)
                The remaining {100-state.contractProperties.totalShares/10000}% of all funds will be send to the Envoy address.
            </div>
            <table id="ShareholderList">
                <thead>
                    <tr>
                        <td>
                            Shareholder address
                        </td>
                        <td>
                            %
                        </td>
                    </tr>
                </thead>
                <tbody>
                    { (state.contractProperties.shareholdersLength == 0) ? (
                        <tr key='0'>
                            <td>
                                No shareholders yet
                            </td>
                            <td>
                                0%
                            </td>
                        </tr>
                        ) : (
                            state.contractProperties.shareholdersData.map(object => (
                            <tr key={object.shareholder}>
                                <td>
                                    {object.shareholder}
                                </td>
                                <td>
                                    {parseInt(object.basepoints)} basepoints
                                </td>
                            </tr>))
                        )
                    }
                </tbody>
             </table>
             <div>
                 Current balance of the contract: {state.contractProperties.balance} wei
             </div>
            <div className='Subtitle'>
                Update a shareholder.
            </div>
            <div>
                <ul>
                    <li> To add or update a shareholder, provide the address and the amount of basepoints (0.01BP = 1%) the share is.</li>
                    <li> To delete an existing shareholder, provide the address and set the amount to 0.</li>
                </ul>
            </div>
            <form  onSubmit={this.handleSubmit}>
                <label>
                    Shareholder:
                    <input type="text" name="shareholder" value={this.state.formProperties.shareholder} onChange={this.handleChange}/>
                        {/* onChange={(e) => {this.handleChange('shareholder', e)}}/> */}
                </label>
                <label>
                    Amount of basepoints (1BP = 0.01%):
                    <input type="text" name="basepoints" value={this.state.formProperties.basepoints} onChange={this.handleChange}/>
                    {/* {(e) => {this.handleChange('basepoints', e)}}/> */}
                </label>                
                <input type="submit" value="Submit"/>
            </form>
            <div className='Subtitle'>
                Distribute the funds as contract owner or withdrawl everything
            </div>
            <div>
                With the button below, you can distribute the funds according to the distribution key of the contract.
            </div>
            <button onClick={this.handleDistribution}>Distribute funds</button>
            <div>
                With the button below, you can withdrawl all the funds to the contract owner address.
            </div>
            <button onClick={this.handleWithdrawl}>Withdrawl all funds</button>
            <div className='Subtitle'>
                Update contract owner.
            </div>
            <div>
                Transfer ownership rights to a new address.
            </div>
            <form  onSubmit={this.handleChangeOwner}>
                <label>
                    New owner:
                    <input type="text" name="newOwner" value={this.state.formProperties.newOwner} onChange={this.handleChange}/>
                        {/* onChange={(e) => {this.handleChange('shareholder', e)}}/> */}
                </label>          
                <input type="submit" value="Submit"/>
            </form>
        </div>
        )
    }
    

}

export default ConnectWeb3