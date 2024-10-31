const xrpl = require('xrpl');

async function checkBalance(address, secret) {
    const client = new xrpl.Client(process.env.XRPL_SERVER_URL);
    try {
        await client.connect();

        const wallet = xrpl.Wallet.fromSeed(secret);

        if (wallet.address !== address) {
            throw new Error('does not match secret');
        }

        const accountInfo = await client.request({
            command: 'account_info',
            account: wallet.address,
            ledger_index: 'validated'
        });

        const balanceInXrp = xrpl.dropsToXrp(accountInfo.result.account_data.Balance);
        console.log(`Balance for ${wallet.address}: ${balanceInXrp} XRP`);

        await client.disconnect();
        return balanceInXrp;
    } catch (error) {
        console.error('Error fetching balance:', error);
        await client.disconnect();
        throw error;
    }
}

module.exports = checkBalance;
