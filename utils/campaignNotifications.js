const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Campaign = require('../models/Campaign');

// Function to notify author when the campaign reaches its goal
async function notifyAuthorOfGoal(client, campaign) {
    const author = await client.users.fetch(campaign.creatorId);

    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`🎉 Campaign Goal Reached! 🎉`)
        .setDescription(`Your campaign "${campaign.name}" has reached its goal of ${campaign.goal} XRP!`)
        .addFields(
            { name: 'Current Amount', value: `${campaign.currentAmount} XRP`, inline: true },
            { name: 'Status', value: 'Goal Met', inline: true }
        );

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`end_campaign_${campaign._id}`)
                .setLabel('End Campaign')
                .setStyle(ButtonStyle.Danger)
        );

    await author.send({ embeds: [embed], components: [row] });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;

        const [action, campaignId] = interaction.customId.split('_');

        if (action === 'end' && campaignId === campaign._id.toString()) {
            await endCampaign(campaignId);
            await interaction.update({ content: `Campaign "${campaign.name}" has been successfully ended.`, components: [] });
        }
    });
}

async function endCampaign(campaignId) {
    try {
        const campaign = await Campaign.findById(campaignId);
        if (campaign) {
            campaign.isComplete = true;
            await campaign.save();
        }
    } catch (error) {
        console.error(`Error ending campaign with ID ${campaignId}:`, error);
    }
}

module.exports = { notifyAuthorOfGoal, endCampaign };
