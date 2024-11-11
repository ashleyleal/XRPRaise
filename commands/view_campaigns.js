const { SlashCommandBuilder } = require('@discordjs/builders');
const Campaign = require('../models/Campaign');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewcampaigns')
        .setDescription('View all crowdfunding campaigns')
        .addBooleanOption(option =>
            option.setName('isactive')
                .setDescription('Filter campaigns by active status')
                .setRequired(false)),
                
    async execute(interaction) {
        const isActive = interaction.options.getBoolean('isactive');
        const guildId = interaction.guildId; 

        try {
            const query = {
                isComplete: isActive !== null ? !isActive : undefined,
                $or: [
                    { visibility: 'global' },
                    { visibility: 'local', guildId: guildId }
                ]
            };

            Object.keys(query).forEach(key => query[key] === undefined && delete query[key]);

            const campaigns = await Campaign.find(query);

            if (campaigns.length === 0) {
                const statusMessage = isActive !== null && isActive ? 'active' : 'all';
                return interaction.reply({ content: `There are currently no ${statusMessage} campaigns available.`, ephemeral: true });
            }

            const campaignList = campaigns.map(campaign => 
                `**Name:** ${campaign.name}\n**Goal:** ${campaign.goal} XRP\n**Current Amount:** ${campaign.currentAmount} XRP\n**Status:** ${campaign.isComplete ? 'Completed' : 'Active'}\n**Visibility:** ${campaign.visibility.charAt(0).toUpperCase() + campaign.visibility.slice(1)}`
            ).join('\n\n');

            await interaction.reply(`Available campaigns:\n\n${campaignList}`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error retrieving the campaigns.', ephemeral: true });
        }
    },
};
