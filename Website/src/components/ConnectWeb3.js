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
                _contractOwner: '',
                totalShares: 0,
                totalBasePoints: 0,
                shareholdersLength: 0,
                shareholdersData: [],
            },
            formProperties: {
                shareholder: '',
                basepoints: '',
            }
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
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
        state.contractProperties._contractOwner = await state.contractReadOnly.methods._contractOwner().call()
        state.contractProperties.totalShares = await state.contractReadOnly.methods.totalBasePoints().call()
        state.contractProperties.shareholdersLength = await state.contractReadOnly.methods.getShareholdersLength().call()
        for(let i=0; i < state.contractProperties.shareholdersLength; i++){
            let shareholder = await state.contractReadOnly.methods.shareholders(i).call()
            let shareholderInfo = await state.contractReadOnly.methods.distributionKey(shareholder).call()
            shareholderInfo = {shareholder: shareholder, basepoints: shareholderInfo.basePoint/1000}
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
        let receipt = await this.state.contract.methods.setShareHolder(this.state.formProperties.shareholder, this.state.formProperties.basepoints).call()
        console.log(receipt)
        alert('Transaction submitted!');
    }



    render() {
        let state = this.state

        return (
        <div>
            <div className='Title'>
                Testing routing contract with address {this.props.contractAddress} on {this.getConnectedNetwork(state.connectedNetwork)}<br></br>
                User connected is '{state.connectedWallet}'.<br></br>
                Only contract owner ({state.contractProperties._contractOwner}) can modify the contract.
            </div>
            <div className='Subtitle'>
                Get list of shareholders (currently {state.contractProperties.shareholdersLength} present, with total share of {state.contractProperties.totalShares/10000}%)
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
                                    {object.basePoint}%
                                </td>
                            </tr>))
                        )
                    }
                </tbody>
             </table>
             <div>
                <form  onSubmit={this.handleSubmit}>
                    <label>
                        New shareholder:
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
             </div>
        </div>
        )
    }
    

}

export default ConnectWeb3