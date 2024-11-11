const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js'); 
const Campaign = require('../models/Campaign');
const createXummPayload = require('../utils/createXummPayload'); 
const sendXrpPayment = require('../services/xrplPayment');
const checkBalance = require('../utils/check_balance');
const { notifyAuthorOfGoal } = require('../utils/campaignNotifications'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('contribute')
        .setDescription('Contribute to a crowdfunding campaign')
        .addStringOption(option =>
            option.setName('campaign_name')
                .setDescription('The name of the campaign to contribute to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount to contribute')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('anonymous')
                .setDescription('Whether the contribution should be anonymous')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('xumm')
                .setDescription('Use XUMM for transaction approval')
                .setRequired(false)),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); // Defer the interaction

        const campaignName = interaction.options.getString('campaign_name');
        const amount = interaction.options.getInteger('amount');
        const isAnonymous = interaction.options.getBoolean('anonymous') || false;
        const useXumm = interaction.options.getBoolean('xumm') || false;

        try {
            const campaign = await Campaign.findOne({ name: campaignName });

            if (!campaign) {
                return interaction.editReply({ content: 'Campaign not found.' });
            }

            if (campaign.isComplete) {
                return interaction.editReply({ content: `Campaign "${campaign.name}" has already ended.` });
            }

            const contributorId = isAnonymous ? '000000000' : interaction.user.id;
            
            if (useXumm) {
                const payloadData = {
                    txjson: {
                        TransactionType: 'Payment',
                        Destination: process.env.XRPL_RECIPIENT_ADDRESS,
                        Amount: (amount * 1000000).toString() // convert XRP to drops
                    },
                    options: {
                        return_url: {
                            app: 'https://yourapp.com/transaction-confirmation',
                            web: 'https://yourapp.com/transaction-web'
                        },
                        expire: 300 // payload expiration time in seconds
                    }
                };
    
                // send payload to XUMM and get the approval URL
                const payload = await createXummPayload(payloadData);
    
                // reply with the approval URL for the user to authorize the transaction in the XUMM app
                await interaction.followUp({
                    content: `Please approve your contribution by clicking [here](${payload.next.always})`,
                    ephemeral: true
                });

            } else {
                // old method - check balance and send directly
                const senderAddress = process.env.XRPL_SENDER_ADDRESS;
                const senderSecret = process.env.XRPL_SENDER_SECRET;
                const balance = await checkBalance(senderAddress, senderSecret);

                if (balance < amount) {
                    return interaction.editReply({ content: 'Insufficient balance to complete the transaction.' });
                }

                const recipientAddress = process.env.XRPL_RECIPIENT_ADDRESS;
                await sendXrpPayment(senderSecret, recipientAddress, amount);

                await interaction.editReply({
                    content: `Successfully contributed ${amount} XRP to "${campaign.name}"!`
                });
            }

            // Update the campaign's current amount
            campaign.currentAmount += amount;
            campaign.contributors.push({
                amount: amount,
                time: new Date(),
                contributorId: contributorId,
            });

            await campaign.save();

            // Notify author if goal is reached
            if (campaign.currentAmount >= campaign.goal) {
                await notifyAuthorOfGoal(interaction.client, campaign);
            }

            // Create an embed to display updated campaign details
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Contribution Made!')
                .setDescription(`${isAnonymous ? 'An anonymous contributor' : interaction.user.username} contributed ${amount} XRP to "${campaign.name}"!`)
                .addFields(
                    { name: 'Current Amount', value: `${campaign.currentAmount} XRP`, inline: true },
                    { name: 'Goal', value: `${campaign.goal} XRP`, inline: true },
                )
                .setTimestamp();

            if (campaign.imageUrl) embed.setThumbnail(campaign.imageUrl);

            await interaction.followUp({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'There was an error processing your contribution.' });
        }
    },
};
