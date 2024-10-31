const { SlashCommandBuilder } = require('@discordjs/builders');
const Campaign = require('../models/Campaign');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('end_campaign')
        .setDescription('End a crowdfunding campaign')
        .addStringOption(option =>
            option.setName('campaign_name')
                .setDescription('The name of the campaign to end')
                .setRequired(true)),
    async execute(interaction) {
        const campaignName = interaction.options.getString('campaign_name');
        const userId = interaction.user.id; 

        try {
            const campaign = await Campaign.findOne({ name: campaignName });

            if (!campaign) {
                return interaction.reply({ content: 'Campaign not found.', ephemeral: true });
            }
            if (campaign.creatorId !== userId) {
                return interaction.reply({ content: 'You do not have permission to end this campaign.', ephemeral: true });
            }

            if (campaign.isComplete) {
                return interaction.reply({ content: 'This campaign has already ended.', ephemeral: true });
            }
            campaign.isComplete = true; 
            await campaign.save();

            await interaction.reply(`Successfully ended the campaign "${campaign.name}". Total amount raised: ${campaign.currentAmount} XRP/${campaign.goal} XRP.`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error ending the campaign.', ephemeral: true });
        }
    },
};