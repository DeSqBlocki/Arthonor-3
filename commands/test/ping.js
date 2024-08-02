const { SlashCommandBuilder } = require('discord.js')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('returns pong'),
    async execute(interaction) {
        await interaction.deferReply()
        await interaction.editReply('pong!')
        await interaction.followUp('another pong!')
    }
}