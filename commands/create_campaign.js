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

        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Upload an image to represent the campaign')),

    async execute(interaction) {
        const name = interaction.options.getString('name');
        const goal = interaction.options.getInteger('goal');
        const description = interaction.options.getString('description');
        const attachment = interaction.options.getAttachment('image');
        let imageUrl = attachment ? attachment.url : null;

        const timeCreated = new Date();

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
            });

            await campaign.save();

            const embed = new EmbedBuilder() 
                .setColor('#0099ff')
                .setTitle(`Campaign Created: "${name}"`)
                .setDescription(description)
                .addFields(
                    { name: 'Goal', value: `${goal} XRP`, inline: true },
                    { name: 'Created At', value: timeCreated.toLocaleString(), inline: true }
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
