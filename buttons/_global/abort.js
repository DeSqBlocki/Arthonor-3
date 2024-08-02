const { EmbedBuilder } = require("discord.js")
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

module.exports = {
    name: 'abort',
    description: 'abort it',
    async execute(interaction) {
        const embed = new EmbedBuilder()
        .setTitle('Aborted')
        .setDescription('Schließe Menü. . .')

        await interaction.update({
            embeds: [embed],
            components: []
        })
        await delay(2000).then(interaction.deleteReply())
    }
}