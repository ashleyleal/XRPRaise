const { SlashCommandBuilder } = require('@discordjs/builders');
const Campaign = require('../models/Campaign');

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
                .setRequired(true)),
    async execute(interaction) {
        const campaignName = interaction.options.getString('campaign_name'); 
        const amount = interaction.options.getInteger('amount');

        try {
            const campaign = await Campaign.findOne({ name: campaignName });

            if (!campaign) {
                return interaction.reply({ content: 'Campaign not found.', ephemeral: true });
            }

            if (campaign.isComplete) {
                return interaction.reply({ content: `Campaign "${campaign.name}" has already ended.`, ephemeral: true });
            }
            
            campaign.currentAmount += amount;

            campaign.contributors.push({
                amount: amount,
                time: new Date(), 
                contributorId: interaction.user.id, 
            });

            await campaign.save();

            await interaction.reply(`Successfully contributed $${amount} to campaign "${campaign.name}". Current amount: $${campaign.currentAmount}.`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error processing your contribution.', ephemeral: true });
        }
    },
};
