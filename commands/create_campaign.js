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

        try {
            const campaign = new Campaign({
                name,
                goal,
                creatorId: interaction.user.id,
                currentAmount: 0, 
                isComplete: false,
            });

            await campaign.save();
            await interaction.reply(`Campaign "${name}" created with a goal of $${goal}.`);
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
