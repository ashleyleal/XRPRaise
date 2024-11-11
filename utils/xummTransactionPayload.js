// xummTransactionPayload.js
function createTransactionPayload(destination, amount) {
    return {
        txjson: {
            TransactionType: 'Payment',
            Destination: destination,
            Amount: (amount * 1000000).toString() //XRP to drops
        },
        options: {
            return_url: {
                app: 'https://yourapp.com/transaction-confirmation',
                web: 'https://yourapp.com/transaction-web'
            },
            expire: 300 
        }
    };
}

module.exports = createTransactionPayload;
