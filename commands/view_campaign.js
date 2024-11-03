const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Campaign = require('../models/Campaign');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view_campaign')
        .setDescription('View details of a specific crowdfunding campaign')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the campaign to view')
                .setRequired(true)),
    
    async execute(interaction) {
        const campaignName = interaction.options.getString('name');

        try {
            const campaign = await Campaign.findOne({ name: campaignName });
            
            if (!campaign) {
                return interaction.reply({ content: 'Campaign not found.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Campaign: "${campaign.name}"`)
                .setDescription(campaign.description || 'No description provided.')
                .addFields(
                    { name: 'Goal', value: `${campaign.goal} XRP`, inline: true },
                    { name: 'Current Amount', value: `${campaign.currentAmount} XRP`, inline: true },
                    { name: 'Creator', value: `<@${campaign.creatorId}>`, inline: true },
                    { name: 'Created At', value: new Date(campaign.timeCreated).toLocaleString(), inline: true },
                    { name: 'Deadline', value: campaign.deadline ? new Date(campaign.deadline).toLocaleString() : 'None', inline: true },
                    { name: 'Status', value: campaign.isComplete ? 'Complete' : 'Ongoing', inline: true }
                );
            
            if (campaign.imageUrl) {
                embed.setImage(campaign.imageUrl);
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error retrieving the campaign details.', ephemeral: true });
        }
    },
};
