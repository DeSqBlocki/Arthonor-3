const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
module.exports = {
    name: 'interactive',
    description: 'testing interactive buttons',
    async execute(message, args) {
        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel('Test')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('test_button_1')
        )
        
      await message.reply({ content: 'Here is an interactive button:', components: [row] });
    }
}