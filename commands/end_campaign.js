const { SlashCommandBuilder } = require('@discordjs/builders');
const Campaign = require('../models/Campaign');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('endcampaign')
        .setDescription('End a crowdfunding campaign')
        .addStringOption(option =>
            option.setName('campaign_name')
                .setDescription('The name of the campaign to end')
                .setRequired(true)),
    async execute(interaction) {
        const campaignName = interaction.options.getString('campaign_name');

        try {
            const campaign = await Campaign.findOne({ name: campaignName });
            const campaignSuccess = campaign.currentAmount >= campaign.goal;

            if (!campaign) {
                return interaction.reply({ content: 'Campaign not found.', ephemeral: true });
            }

            campaign.isComplete = true;
            await campaign.save();

            await interaction.reply(`Successfully ended the campaign "${campaign.name}". Total amount raised: ${campaign.currentAmount} XRP/${campaign.goal} XRP. Campaign was a ${campaignSuccess ? 'success' : 'failure'}.`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error ending the campaign.', ephemeral: true });
        }
    },
};