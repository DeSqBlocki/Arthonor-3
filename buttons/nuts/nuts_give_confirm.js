const { EmbedBuilder } = require("discord.js")
const { mClient } = require("../..")
require('dotenv').config()

module.exports = {
    name: 'nuts_give_confirm',
    description: 'confirm it',
    async execute(interaction) {
        const from = interaction.user
        let temp = await interaction.message.embeds[0].description.split(' ')
        const amount = Number(temp[3].split('**')[1])
        const to = await interaction.message.guild.members.fetch(temp[6].slice(2,-1))

        const db = mClient.db(process.env.M_DB)
        const nutsColl = db.collection('nuts')
        await nutsColl.findOneAndUpdate({ userID: from.id }, { $inc: { nuts: -amount } }, { upsert: true })
        await nutsColl.findOneAndUpdate({ userID: to.id }, { $inc: { nuts: +amount } }, { upsert: true })

        const yourBalance = await nutsColl.findOne({ userID: from.id })
        const theirBalance = await nutsColl.findOne({ userID: to.id })
        const embed = new EmbedBuilder()
        .setTitle('Gib Nuss!')
        .setDescription(`Willst du wirklich **${amount}** Nüsse an <@${to.id}> senden?`)
        .addFields(
            { name: `Your Current Balance`, value: `${yourBalance.nuts} (**-${amount}**)`, inline: true },
            { name: `Your New Balance`, value: `${yourBalance.nuts - amount}`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: `Their Current Balance`, value: `${theirBalance.nuts} (**+${amount}**)`, inline: true },
            { name: `Their New Balance`, value: `${theirBalance.nuts + amount}`, inline: true }
        )
        .setThumbnail(to.displayAvatarURL())
            await interaction.update({
                embeds: [ embed ]
            })

        const newEmbed = new EmbedBuilder()
        .setTitle('Gib Nuss!')
        .setDescription(`Du hast **${amount}** Nuts an <@${to.id}> gesendet!`)
        .setFooter({ text: 'Um den gleichen Wert zu senden, klick einfach nochmal auf ✔' })
        .setThumbnail(to.user.displayAvatarURL())
        await interaction.followUp({
            embeds: [ newEmbed ],
            components: [],
        })
    }
}