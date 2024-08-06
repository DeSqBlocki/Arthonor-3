const { EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder, PermissionFlagsBits, RoleSelectMenuComponent, UserSelectMenuComponent } = require("discord.js")
const { mClient } = require("../..")
require('dotenv').config()

module.exports = {
    name: 'quotes_list_mentionable',
    description: 'handles quotes list mentionables',
    async execute(interaction) {
        const embedData = await interaction.message.embeds[0].data
        const embed = new EmbedBuilder()
        if (!interaction.members) {
            embed.setTitle(embedData.title)
                .setThumbnail(embedData.thumbnail.url)
                .setDescription(embedData.description);
        } else {
            const target = await interaction.guild.members.fetch(interaction.members.keys().next().value)
            const db = mClient.db(process.env.M_DB)
            const quotesColl = db.collection('quotes')
            const quotes = await quotesColl.find({ by: target.id }).toArray()
            const member = interaction.message.guild.members.cache.get(target.user.id)
            const memberRoles = member.roles.cache
                .filter((roles) => roles.id !== interaction.message.guild.id)
                .map((role) => role.toString())

            const description = String(`${target}\r\n\r\n${memberRoles}`).replaceAll(',', ' ')
            embed.setTitle(`- User Stats -`)
                .setDescription(description)
                .setThumbnail(target.displayAvatarURL())
                .addFields({
                    name: 'Number of Quotes:', value: `${quotes.length}`, inline: true
                })
                .setFooter({ text: (`${new Date().toLocaleDateString('en-US', { weekday: 'short' })} ${new Date().toLocaleDateString('en-US', { month: 'short' })} ${new Date().getDate()} ${new Date().getFullYear()} UserID <@${member.id}>`) })
        }
        const select = new ActionRowBuilder()
            .addComponents(
                new UserSelectMenuBuilder()
                    .setCustomId('quotes_list_mentionable')
                    .setPlaceholder('Filter By User')
            )

        const row = interaction.message.components[1]
        await interaction.update({
            embeds: [embed],
            components: [select, row]
        })
    }
}