const xrpl = require('xrpl');

// connect to the XRP Ledger via client
const client = new xrpl.Client(process.env.XRPL_SERVER_URL);

async function sendXrpPayment(senderSecret, recipientAddress, amount) {
    try {
        await client.connect();
        const senderWallet = xrpl.Wallet.fromSecret(senderSecret);
        const paymentAmount = xrpl.xrpToDrops(amount);

        const payment = {
            TransactionType: 'Payment',
            Account: senderWallet.address,
            Destination: recipientAddress,
            Amount: paymentAmount,
        };

        const preparedTx = await client.autofill(payment);
        const signedTx = senderWallet.sign(preparedTx);

        const txResponse = await client.submitAndWait(signedTx.tx_blob);
        await client.disconnect();

        return txResponse;
    } catch (error) {
        console.error('Error sending payment:', error);
        await client.disconnect();
        throw error;
    }
}

module.exports = sendXrpPayment;
