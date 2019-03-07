const path=require('path'); //as we could just do require ('/inbox') as it is a solidity file and not js
const fs=require('fs');	
const solc=require('solc');

const projectPath=path.resolve(__dirname,'contracts','lottery.sol');	//defining the path of the solidity file
const source=fs.readFileSync(projectPath,'utf8');	//reading the file and defining its encoding
module.exports= solc.compile(source,1).contracts[':Lottery'];	//compiling the file and also the no. of different contracts we want to compile in this case its 1
  
