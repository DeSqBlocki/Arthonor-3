const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { mClient } = require("../..")
require('dotenv').config()

module.exports = {
    name: 'honor_menu_dishonor',
    description: 'honor menu dishonor button',
    async execute(interaction) {
        let description = interaction.message.embeds[0].data.description
        const target = await interaction.guild.members.fetch(description.split(' ')[0].slice(2, -1))
        const db = mClient.db(process.env.M_DB)
        const honorsColl = db.collection('honors')
        const reason = `[-] Quick Menu Dishonor`
        const theirHonorLevel = await honorsColl.findOne({ userID: target.id })
    
        const embed = new EmbedBuilder()
            .setTitle('- Honor Menu WIP -')
            .setDescription(`Willst du wirklich <@${target.id}> einen **Dishonor** geben?\r\n[Grund: ${reason}]`)
            .addFields({
                name: 'Current Honor Level', value: `${theirHonorLevel?.honors ?? 0} (**-1**)`
            })
            .setThumbnail(target.displayAvatarURL())
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('✔')
                    .setCustomId('honor_multi_confirm')
                    .setStyle(ButtonStyle.Success)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel('✖')
                    .setCustomId('abort')
                    .setStyle(ButtonStyle.Danger)
            )
        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        })
    }
}