// console.clear();
const { AccountId, PrivateKey, Client, FileCreateTransaction, ContractCreateTransaction, ContractFunctionParameters, ContractExecuteTransaction, ContractCallQuery, Hbar, ContractCreateFlow, } = require("@hashgraph/sdk");
require("dotenv").config();
const fs = require("fs");

async function main() {

    // Configure accounts 
    const myAccountId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
    const myPrivateKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);

    //setting client for test net
    const client = Client.forTestnet().setOperator(myAccountId, myPrivateKey);

    // If we weren't able to grab it, we should throw a new error
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

    // Import the compiled contract bytecode
    const contractBytecode = fs.readFileSync("LookupContract_sol_LookupContract.bin");
    // console.log(`contractBytecode:${contractBytecode}`);
    // console.log('------------------------------------ x -------------------------------------');

    // Instantiate the smart contract
    const contractInstantiateTx = new ContractCreateFlow()
        .setBytecode(contractBytecode)
        .setGas(100000)
        .setConstructorParameters(
            new ContractFunctionParameters().addString("Md Abid Khan").addUint256(7566180786)
        );
    // console.log('------------------------------------ contractInstantiateTx -------------------------------------');
    // console.log(contractInstantiateTx);
    // console.log('-------------------------------------------------------------------------');

    //executing the transaction
    const contractInstantiateSubmit = await contractInstantiateTx.execute(client);
    // console.log('------------------------------------ contractInstantiateSubmit -------------------------------------');
    // console.log(contractInstantiateSubmit);
    // console.log('-------------------------------------------------------------------------');

    //getting receipt of the transaction
    const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(client);
    console.log('------------------------------------ contractInstantiateRx -------------------------------------');
    console.log(contractInstantiateRx);
    console.log('-------------------------------------------------------------------------');

    //getting the contractID from the instantiated contract
    const contractId = contractInstantiateRx.contractId;
    console.log(`contractId:${contractId}`);
    // console.log('-------------------------------------------------------------------------');

    //getting the contractId in solidity format
    // const contractAddress = contractId.toSolidityAddress();
    // console.log(`The smart contract ID in Solidity format is: ${contractAddress}`);

    // Query the contract to check changes in state variable
    const contractQueryTx = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Md Abid Khan"));
    // console.log(contractQueryTx);
    console.log('------------------------------------ xxxxx -------------------------------------');

    const contractQuerySubmit = await contractQueryTx.execute(client);
    // console.log(contractQuerySubmit);
    const contractQueryResult = contractQuerySubmit.getUint256(0);
    console.log(`- Here's the phone number that you asked for: ${contractQueryResult} \n`);

    // // Call contract function to update the state variable
    const contractExecuteTx = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction(
            "setMobileNumber",
            new ContractFunctionParameters().addString("MAK2").addUint256(9087654321)
        );

    const contractExecuteSubmit = await contractExecuteTx.execute(client);
    const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
    console.log(`- Contract function call status: ${contractExecuteRx.status} \n`);

    // Query the contract to check changes in state variable
    const contractQueryTx1 = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("MAK2"));
    const contractQuerySubmit1 = await contractQueryTx1.execute(client);
    const contractQueryResult1 = contractQuerySubmit1.getUint256(0);
    console.log(`- Here's the phone number that you asked for: ${contractQueryResult1} \n`);
}
main();