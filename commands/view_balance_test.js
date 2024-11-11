const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const checkBalance = require('../utils/check_balance'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check_balance')
        .setDescription('Check the balance of the sender or recipient account')
        .addStringOption(option =>
            option.setName('account')
                .setDescription('Choose the account to check the balance for')
                .setRequired(true)
                .addChoices(
                    { name: 'Sender', value: 'sender' },
                    { name: 'Recipient', value: 'recipient' }
                )),
    async execute(interaction) {
        const accountType = interaction.options.getString('account');
        
        const senderAddress = process.env.XRPL_SENDER_ADDRESS;
        const senderSecret = process.env.XRPL_SENDER_SECRET;
        const recipientAddress = process.env.XRPL_RECIPIENT_ADDRESS;
        const recipientSecret = process.env.XRPL_RECIPIENT_SECRET;

        let address;
        let secret;

        if (accountType === 'sender') {
            address = senderAddress;
            secret = senderSecret;
        } else if (accountType === 'recipient') {
            address = recipientAddress;
            secret = recipientSecret;
        }

        try {
            const balance = await checkBalance(address, secret); 

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Balance for ${accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account`)
                .addFields(
                    { name: 'Account Address', value: address, inline: false },
                    { name: 'Balance (XRP)', value: `${balance}`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error retrieving balance:', error);
            await interaction.reply({ content: 'There was an error retrieving the balance.', ephemeral: true });
        }
    },
};
