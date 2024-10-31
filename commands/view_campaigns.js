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
        console.log('isActive:', isActive); 

        try {
            const query = isActive !== null ? { isComplete: !isActive } : {}; 
            console.log('Query:', query); 
            
            const campaigns = await Campaign.find(query);
            console.log('Campaigns:', campaigns);  
            
            if (campaigns.length === 0) {
                const statusMessage = isActive !== null && isActive ? 'active' : 'all';
                return interaction.reply({ content: `There are currently no ${statusMessage} campaigns.`, ephemeral: true });
            }

            const campaignList = campaigns.map(campaign => 
                `**Name:** ${campaign.name}\n**Goal:** ${campaign.goal} XRP\n**Current Amount:** ${campaign.currentAmount} XRP\n**Status:** ${campaign.isComplete ? 'Completed' : 'Active'}`
            ).join('\n\n');

            await interaction.reply(`All campaigns:\n\n${campaignList}`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error retrieving the campaigns.', ephemeral: true });
        }
    },
};
