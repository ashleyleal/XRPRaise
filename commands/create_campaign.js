const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js'); 
const Campaign = require('../models/Campaign');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create_campaign')
        .setDescription('Create a new crowdfunding campaign')
        
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the campaign')
                .setRequired(true))
        
        .addIntegerOption(option =>
            option.setName('goal')
                .setDescription('The goal amount for the campaign in XRP')
                .setRequired(true))

        .addStringOption(option =>
            option.setName('description')
                .setDescription('A brief description of the campaign')
                .setRequired(true))

        .addStringOption(option =>
            option.setName('visibility')
                .setDescription('Set the visibility of the campaign')
                .addChoices(
                    { name: 'Local', value: 'local' },
                    { name: 'Global', value: 'global' }
                )
                .setRequired(true))

        .addStringOption(option =>
            option.setName('deadline')
                .setDescription('The deadline for the campaign (format: YYYY-MM-DD)'))

        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Upload an image to represent the campaign')),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const goal = interaction.options.getInteger('goal');
        const description = interaction.options.getString('description');
        const visibility = interaction.options.getString('visibility');
        const attachment = interaction.options.getAttachment('image');
        const imageUrl = attachment ? attachment.url : null;
        const timeCreated = new Date();
        const deadline = interaction.options.getString('deadline') ? new Date(interaction.options.getString('deadline')) : null;
        const guildId = interaction.guildId;

        try {
            const campaign = new Campaign({
                name,
                goal,
                creatorId: interaction.user.id,
                currentAmount: 0,
                isComplete: false,
                description,
                imageUrl,
                timeCreated,
                deadline,
                visibility,
                guildId: visibility === 'local' ? guildId : null // only set guildId for local campaigns
            });

            await campaign.save();

            const embed = new EmbedBuilder() 
                .setColor('#0099ff')
                .setAuthor({name: `${interaction.user.username}`, iconURL: interaction.user.avatarURL()})
                .setTitle(`Campaign Created: "${name}"`)
                .setDescription(description)
                .addFields(
                    { name: 'Goal', value: `${goal} XRP`, inline: true },
                    { name: 'Visibility', value: visibility.charAt(0).toUpperCase() + visibility.slice(1), inline: true },
                    { name: 'Created At', value: timeCreated.toLocaleString(), inline: true },
                    { name: 'Deadline', value: deadline ? deadline.toLocaleString() : 'None', inline: true }
                );

            if (imageUrl) {
                embed.setImage(imageUrl);
            }

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            if (error.code === 11000) { // duplicate error
                await interaction.reply({ content: 'A campaign with that name already exists. Please choose a different name.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error creating the campaign.', ephemeral: true });
            }
        }
    },
};
