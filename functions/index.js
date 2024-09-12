const {fetchTransactions} = require('./fetchTransactions');
const {getWalletAndTokens} = require('./getWalletandTokens');
const {getTokenAddresses} = require('./getTokenAddresses');
const {getWalletAddresses} = require('./getWalletAddresses');
const {addTokenAddress} = require('./addTokenAddress');
const {addWalletAddress} = require('./addWalletAddress');
const {addUserToFirestore} = require('./addUserToFirestore');
const {filterTransactions} = require('./filterTransactions');

exports.fetchTransactions = fetchTransactions;
exports.getWalletAndTokens = getWalletAndTokens;
exports.getTokenAddresses = getTokenAddresses;
exports.getWalletAddresses = getWalletAddresses;
exports.addTokenAddress = addTokenAddress;
exports.addWalletAddress = addWalletAddress;
exports.addUserToFirestore = addUserToFirestore;
exports.filterTransactions = filterTransactions;