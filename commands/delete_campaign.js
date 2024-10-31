const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Campaign = require('../models/Campaign');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete_campaign')
        .setDescription('Delete a campaign you created')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the campaign to delete')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('name');

        const campaign = await Campaign.findOne({ name });
        if (!campaign) {
            return interaction.reply({ content: 'Campaign not found.', ephemeral: true });
        }

        if (campaign.creatorId !== interaction.user.id) {
            return interaction.reply({ content: 'You do not have permission to delete this campaign.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Delete Campaign: "${campaign.name}"`)
            .setDescription('Are you sure you want to delete this campaign? This action cannot be undone.')
            .setColor('#FF0000');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_delete')
                    .setLabel('Yes')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('cancel_delete')
                    .setLabel('No')
                    .setStyle(ButtonStyle.Secondary),
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        const filter = (btnInteraction) => btnInteraction.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (btnInteraction) => {
            if (btnInteraction.customId === 'confirm_delete') {
                await Campaign.deleteOne({ name });
                await btnInteraction.update({ content: `Campaign "${campaign.name}" has been deleted.`, embeds: [], components: [] });
            } else if (btnInteraction.customId === 'cancel_delete') {
                await btnInteraction.update({ content: 'Campaign deletion canceled.', embeds: [], components: [] });
            }
            collector.stop();
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                interaction.editReply({ content: 'Campaign deletion timed out.', components: [] });
            }
        });
    },
};
