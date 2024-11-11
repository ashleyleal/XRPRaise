const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Campaign = require('../models/Campaign');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_contributors')
        .setDescription('List all contributors to a specific campaign')
        .addStringOption(option =>
            option.setName('campaign_name')
                .setDescription('The name of the campaign to view contributors for')
                .setRequired(true)),

    async execute(interaction) {
        const campaignName = interaction.options.getString('campaign_name');

        try {
            const campaign = await Campaign.findOne({ name: campaignName });

            if (!campaign) {
                return interaction.reply({ content: 'Campaign not found.', ephemeral: true });
            }

            if (campaign.contributors.length === 0) {
                return interaction.reply({ content: `No contributors found for "${campaign.name}".`, ephemeral: true });
            }

            // sort contributors by amount in descending order
            const sortedContributors = campaign.contributors.sort((a, b) => b.amount - a.amount);

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Contributions to "${campaign.name}"`)

            for (let i = 0; i < sortedContributors.length; i++) {
                const contributor = sortedContributors[i];
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';

                try {
                    const user = await interaction.client.users.fetch(contributor.contributorId);
                    const tag = user.tag;
                    
                    embed.addFields(
                        { name: `${medal} Contributor`, value: `${tag}`, inline: true },
                        { name: 'Amount', value: `${contributor.amount} XRP`, inline: true },
                        { name: 'Date', value: contributor.time.toLocaleString(), inline: true }
                    );

                } catch (fetchError) {
                    console.error(`Failed to fetch user with ID ${contributor.contributorId}:`, fetchError);
                    embed.addFields(
                        { name: `${medal} Contributor`, value: `Unknown User`, inline: true },
                        { name: 'Amount', value: `${contributor.amount} XRP`, inline: true },
                        { name: 'Date', value: contributor.time.toLocaleString(), inline: true }
                    );
                }
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error fetching contributors.', ephemeral: true });
        }
    },
};
