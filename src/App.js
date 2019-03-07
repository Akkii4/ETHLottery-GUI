import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import lottery from './lottery';

class App extends Component {
    state={manager:" ",
           players:[],
           balance:" ",
           amount:" ",
           message:" "}; 
    async componentDidMount()
    {
      const manager=await lottery.methods.manager().call();
      const players=await lottery.methods.getPlayers().call();
      const balance=await web3.eth.getBalance(lottery.options.address);
      this.setState({manager,players,balance});
    }
    onSubmit=async event=>{
      event.preventDefault();
      const accounts=await web3.eth.getAccounts();
      this.setState({message:"Waiting for transaction to be confirmed..."});
      await lottery.methods.enter().send({
        from:accounts[0],
        value:web3.utils.toWei(this.state.amount,'ether')
      });
      this.setState({message:"You have been entered successfully, BEST OF LUCK"});
    }
    onClick=async ()=>{
       const accounts=await web3.eth.getAccounts();
       this.setState({message:"Waiting for the transaction to be confirmed..."});
       await lottery.methods.pickWinner().send({from:accounts[0]});
       this.setState({message:`Winner is ${await lottery.methods.lastWinner().call()} picked`});
    }
    render() {
    return (
      <div className="App" >
      <h2>Lottery Contract</h2>
      <p >Manager of this Contract is {this.state.manager}</p>  
      <p>There are currently {this.state.players.length} people entered,
      competing to win {web3.utils.fromWei(this.state.balance,'ether')} ether.
      </p>
      <hr />
      <form onSubmit={this.onSubmit}>
      <h4>Want to try your luck?</h4>
      <div>
        <label>Amount of ether to enter</label>
        <input
              amount={this.state.amount}
              onChange={event=>this.setState({amount:event.target.value})}
        />
      </div>
      <button>Enter</button>
      </form>
      <hr />
      <button onClick={this.onClick}>Pick a winner</button>
      <p><u>Note: The Winner can only be picked by the Manager of the Contract</u></p> 
      <h1>{this.state.message}</h1>
      </div>
    );
  }
}

export default App;
