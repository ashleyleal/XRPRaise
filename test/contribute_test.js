const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js'); 
const Campaign = require('../models/Campaign');
const sendXrpPayment = require('../services/xrplPayment'); 
const checkBalance = require('../utils/check_balance'); 

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
                .setRequired(false)),
    async execute(interaction) {
        const campaignName = interaction.options.getString('campaign_name'); 
        const amount = interaction.options.getInteger('amount');
        const isAnonymous = interaction.options.getBoolean('anonymous') || false; 

        try {
            const campaign = await Campaign.findOne({ name: campaignName });

            if (!campaign) {
                return interaction.reply({ content: 'Campaign not found.', ephemeral: true });
            }

            if (campaign.isComplete) {
                return interaction.reply({ content: `Campaign "${campaign.name}" has already ended.`, ephemeral: true });
            }

            // check sender's balance before proceeding
            const senderAddress = process.env.XRPL_SENDER_ADDRESS;
            const senderSecret = process.env.XRPL_SENDER_SECRET;
            const balance = await checkBalance(senderAddress, senderSecret);

            if (balance < amount) {
                return interaction.reply({ content: 'Insufficient balance to complete the transaction.', ephemeral: true });
            }

            const contributorId = isAnonymous ? '000000000' : interaction.user.id;

            campaign.currentAmount += amount;
            campaign.contributors.push({
                amount: amount,
                time: new Date(), 
                contributorId: contributorId, 
            });

            await campaign.save();

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Contribution Made!')
                .setDescription(`${isAnonymous ? 'An anonymous contributor' : interaction.user.username} contributed ${amount} XRP to "${campaign.name}"!`)
                .addFields(
                    { name: 'Current Amount', value: `${campaign.currentAmount} XRP`, inline: true },
                    { name: 'Goal', value: `${campaign.goal} XRP`, inline: true },
                )
                .setTimestamp();

            campaign.imageUrl ? embed.setThumbnail(campaign.imageUrl) : null;

            await interaction.reply({ embeds: [embed] });

            const recipientAddress = process.env.XRPL_RECIPIENT_ADDRESS;
            await sendXrpPayment(senderSecret, recipientAddress, amount);
            
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error processing your contribution.', ephemeral: true });
        }
    },
};
