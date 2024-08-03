const { EmbedBuilder, UserSelectMenuBuilder, ActionRowBuilder } = require("discord.js")
const { mClient } = require("../..")
require('dotenv').config()
module.exports = {
    name: 'quotes_list_right',
    description: 'navigate right',
    async execute(interaction) {
        let oldEmbed = interaction.message.embeds[0].data
        if (!oldEmbed.footer) { return interaction.reply({ content: 'Please use a Filter', ephemeral: true }) }
        if (oldEmbed.fields && oldEmbed.fields[0].value == 0) { return interaction.reply({ content: 'This User has no Quotes', ephemeral: true }) }

        let userID = interaction.message.embeds[0].data.footer.text.split(' ')[5].slice(2, -1)
        const target = await interaction.guild.members.fetch(userID)
        if (!target) { return interaction.reply({ content: 'Please use a Filter', ephemeral: true }) }

        const db = mClient.db(process.env.M_DB)
        const quotesColl = db.collection('quotes')
        const quotes = await quotesColl.find({ by: target.id }).toArray()

        var index = Number((await interaction.message.embeds[0].data.title).split(' ')[2].slice(1))
        if (!index) { index = 0 }
        //if (index >= quotes.length){ return interaction.reply({content: 'Max Quotes Reached', ephemeral: true})}
        if (index >= quotes.length) { index-- }

        // will automatically reflect the next index due to how arrays think

        const found = quotes[index]
        const guild = await interaction.client.guilds.fetch(found.guildID)
        const channel = await guild.channels.fetch(found.channelID)
        const message = await channel.messages.fetch(found.messageID)

        var msgData = {
            content: message.content,
            author: await message.author,
            reference: await message.reference,
            embed: await message.embeds ? 'embed' : null
        } // debug
        if (msgData.reference) {
            let refMessage = await channel.messages.fetch(msgData.reference.messageId)
            var refData = {
                content: refMessage.content,
                author: await refMessage.author,
                embed: await refMessage.embeds.length > 0 ? 'embed' : null
            }
        }

        var description = ''
        if (refData) {
            description += `> ${refData.author}`
            if (refData.embed) {
                description += '*an embed / a command* '
            } else {
                description += refData.content
            }
            description += `\r\n↳`
        }
        let messageLink = `https://discord.com/channels/${found.guildID}/${found.channelID}/${found.messageID}`
        description += `${msgData.author} ${msgData.content}\r\n\r\n${messageLink}`
        let timestamp = new Date(message.createdTimestamp)
        let footer = timestamp.toDateString().toString()

        const embed = new EmbedBuilder()
            .setThumbnail(msgData.author.displayAvatarURL())
            .setURL(messageLink)
            .setTitle(`- Quote #${index + 1} -`)
            .setDescription(description)
            .setFooter({ text: (`${footer} #${found.messageID} <@${found.by}>`) })
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