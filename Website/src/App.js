import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
//  Link,
  Redirect
} from 'react-router-dom'

import './App.css';

// The ABI (Application Binary Interface) is the interface of the smart contract
import { abiContract } from './abi-contract.js'

// Settings will be differ
import { webProvider, contractAddress } from './settings.js'

import ConnectWeb3 from './components/ConnectWeb3';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path='/'>
          <Redirect to='/main'/>
        </Route>
        <Route path='/main'>
          <ConnectWeb3 abiContract={abiContract} contractAddress={contractAddress} webProvider={webProvider}/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
