const assert=require("assert");
const ganache=require("ganache-cli");
const Web3 = require("web3");	//Web3 is a constructor function thats why we have capitalize W
const web3=new Web3(ganache.provider()) //making instance web3 of Constructor Web3 and giving provider from ganache
const {interface,bytecode}=require("../compile");

let accounts;
let lotteryContract;
let amount="0.02";
let amount2="0.002";
beforeEach(async()=>{
//get list of all accounts
accounts=await web3.eth.getAccounts()	//contains 10 ethereum accounts from ganache
//use one of them to deploy contracts
lotteryContract=await new web3.eth.Contract(JSON.parse(interface))
.deploy({data:bytecode})
.send({from:accounts[0],gas:'1000000'});//specifying a account and setting max to be used
});

describe("ContractTest",()=>{
	it("Contract Deployed",()=>{	//this test assures that is our contract get successfully deployed
		//here address is the address where our contract is deployed in the ethereum blockchain
		assert.ok(lotteryContract.options.address);	//if lotteryContract.options.address returns a truthy value then this will pass
	});
	it("allow one accont to enter",async ()=>{		//this test assures that one person is succesfully entering the lottery
		await lotteryContract.methods.enter().send({
			from:accounts[0],
			value: web3.utils.toWei(amount,"ether")	//sending ether to participate
			});
		const players=await lotteryContract.methods.getPlayers().call({
			from:accounts[0]
			});
		assert.equal(accounts[0],players[0]);
		assert.equal(1,players.length);
	});
	it("allow multiple acconts to enter",async ()=>{		//this assures that multiple persons could participate
		await lotteryContract.methods.enter().send({
			from:accounts[0],
			value: web3.utils.toWei(amount,"ether")
			});
		await lotteryContract.methods.enter().send({
			from:accounts[1],
			value: web3.utils.toWei(amount,"ether")
			});
		await lotteryContract.methods.enter().send({
			from:accounts[2],
			value: web3.utils.toWei(amount,"ether")
			});
		const players=await lotteryContract.methods.getPlayers().call({
			from:accounts[0]
			});
		assert.equal(accounts[0],players[0]);
		assert.equal(accounts[1],players[1]);
		assert.equal(accounts[2],players[2]);
		assert.equal(3,players.length);
	});
	it("require minimum amount of ether",async ()=>{	//this test is for testing that sending ether less than 0.01 to particpate in lottery throws an error
		try{
			await lotteryContract.methods.enter().send({
			from:accounts[0],
			value: web3.utils.toWei(amount2,"ether")
			});
		   }
		catch (err)
		{   
			assert(err);		
		}
		if(amount2>0.01)
		{
			assert(false);
		}
	}); 
	it("only manager can pick winner",async ()=>{	//only manager(one who deployed the contract on blockchain)can only pick the winner and this test throws an error if someone else try to pick winner
		try{
			await lotteryContract.methods.pickWinner().send({
			from:accounts[1],
			});
		   }
		catch (err)
		{   
			assert(err);
		}
	}); 
	it("sends money to the winner ",async ()=>{	//testing the contract by entering the lottery and winning it also
		await lotteryContract.methods.enter().send({
			from:accounts[0],
			value: web3.utils.toWei("1","ether")
		});
		const initialBalance=await web3.eth.getBalance(accounts[0]);
		await lotteryContract.methods.pickWinner().send({from:accounts[0]});
		const finalBalance=await web3.eth.getBalance(accounts[0]);
		const difference=finalBalance-initialBalance;
		assert(difference>web3.utils.toWei("0.9","ether"));
	});
});