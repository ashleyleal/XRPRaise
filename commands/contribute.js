const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js'); 
const Campaign = require('../models/Campaign');
const createXummPayload = require('../utils/createXummPayload'); 

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
                .setTitle('Contribution Created!')
                .setDescription(`${isAnonymous ? 'An anonymous contributor' : interaction.user.username} is contributing ${amount} XRP to "${campaign.name}"!`)
                .addFields(
                    { name: 'Current Amount', value: `${campaign.currentAmount} XRP`, inline: true },
                    { name: 'Goal', value: `${campaign.goal} XRP`, inline: true },
                )
                .setTimestamp();

            campaign.imageUrl ? embed.setThumbnail(campaign.imageUrl) : null;

            await interaction.reply({ embeds: [embed] });

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

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error processing your contribution.', ephemeral: true });
        }
    },
};
