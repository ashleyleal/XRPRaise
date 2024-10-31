const { SlashCommandBuilder } = require('@discordjs/builders');
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
                .setRequired(true)),
                
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const goal = interaction.options.getInteger('goal');

        const campaign = new Campaign({
            name,
            goal,
            creatorId: interaction.user.id,
        });

        try {
            await campaign.save();
            await interaction.reply(`Campaign "${name}" created with a goal of $${goal}.`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error creating the campaign.', ephemeral: true });
        }
    },
};
