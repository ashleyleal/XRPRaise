const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js'); 
const Campaign = require('../models/Campaign');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit_campaign')
        .setDescription('Edit an existing crowdfunding campaign')

        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the campaign to edit')
                .setRequired(true))

        .addIntegerOption(option =>
            option.setName('goal')
                .setDescription('The updated goal amount for the campaign in XRP'))

        .addStringOption(option =>
            option.setName('description')
                .setDescription('An updated brief description of the campaign'))

        .addStringOption(option =>
            option.setName('deadline')
                .setDescription('The updated deadline for the campaign (format: YYYY-MM-DD)'))

        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Upload a new image to represent the campaign')),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const goal = interaction.options.getInteger('goal');
        const description = interaction.options.getString('description');
        const attachment = interaction.options.getAttachment('image');
        const deadline = interaction.options.getString('deadline') ? new Date(interaction.options.getString('deadline')) : null;
        let imageUrl = attachment ? attachment.url : null;

        try {
            const campaign = await Campaign.findOne({ name });

            if (!campaign) {
                return interaction.reply({ content: `Campaign "${name}" not found.`, ephemeral: true });
            }

            if (goal !== null) campaign.goal = goal;
            if (description) campaign.description = description;
            if (imageUrl) campaign.imageUrl = imageUrl;
            if (deadline) campaign.deadline = deadline;

            await campaign.save();

            const embed = new EmbedBuilder()
                .setColor('#FFA500') // Orange for edit
                .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.avatarURL() })
                .setTitle(`Campaign Updated: "${name}"`)
                .setDescription(campaign.description)
                .addFields(
                    { name: 'Goal', value: `${campaign.goal} XRP`, inline: true },
                    { name: 'Deadline', value: campaign.deadline ? campaign.deadline.toLocaleString() : 'None', inline: true }
                );

            if (campaign.imageUrl) {
                embed.setImage(campaign.imageUrl);
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error updating the campaign.', ephemeral: true });
        }
    },
};
