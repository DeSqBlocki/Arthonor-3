const { EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder, PermissionFlagsBits } = require("discord.js")
const { mClient } = require("../..")
require('dotenv').config()

module.exports = {
    name: 'honor_menu_mentionable',
    description: 'handles honor menu mentionables',
    async execute(interaction) {
        const embedData = await interaction.message.embeds[0].data
        const embed = new EmbedBuilder()
        if (!interaction.members) {
            embed.setTitle(embedData.title)
                .setThumbnail(embedData.thumbnail.url)
                .setDescription(embedData.description);
        } else {
            var target = await interaction.guild.members.fetch(interaction.members.keys().next().value)
            var db = mClient.db(process.env.M_DB)
            var honorsColl = db.collection('honors')
            var theirHonorLevel = await honorsColl.findOne({ userID: target.id })

            const member = interaction.message.guild.members.cache.get(target.user.id)
            const memberRoles = member.roles.cache
                .filter((roles) => roles.id !== interaction.message.guild.id)
                .map((role) => role.toString())

            const description = String(`${target} - ${target.user.globalName ?? target.user.username} - ${target.user.id}\r\n\r\n${memberRoles}`).replaceAll(',', ' ')
            embed.setTitle(`- User Stats -`)
                .setDescription(description)
                .addFields({
                    name: 'Current Honor Level:', value: `${theirHonorLevel?.honors ?? 0}`, inline: true
                })
                .setFooter({ text: 'Honor Level updaten sich nicht automatisch!' })
        }
        const select = new ActionRowBuilder()
            .addComponents(
                new UserSelectMenuBuilder()
                    .setCustomId('honor_menu_mentionable')
                    .setPlaceholder('Select a User')
            )

        const row = interaction.message.components[1]
        await interaction.update({
            embeds: [embed],
            components: [select, row]
        })
    }
}