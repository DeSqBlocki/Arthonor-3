const { EmbedBuilder } = require("discord.js")
const { mClient } = require("../..")
require('dotenv').config()

module.exports = {
    name: 'honor_multi_confirm',
    description: 'confirm it',
    async execute(interaction) {
        let temp = await interaction.message.embeds[0].description.split(' ')
        var honor
        if (temp[5].slice(2, -2) == 'Honor') {
            honor = 1
        } else {
            honor = -1
        }
        const target = await interaction.message.guild.members.fetch(temp[3].slice(2, -1))
        temp = interaction.message.embeds[0].description.split('\r\n')
        const reason = `${temp[1].slice(7, -1)}`

        const db = mClient.db(process.env.M_DB)
        const honorsColl = db.collection('honors')
        const reasonsColl = db.collection('honor-reasons')
        const theirHonorLevel = await honorsColl.findOne({ userID: target.id })

        await honorsColl.findOneAndUpdate({ userID: target.id }, { $inc: { honors: honor } }, { upsert: true })
        await reasonsColl.findOneAndUpdate({ userID: target.id }, { $push: { reasons: reason } }, { upsert: true })

        var description
        var newTitle
        var newDescription
        var newThumbnail

        if (honor == 1) {
            description = `Willst du wirklich <@${target.id}> einen Honor geben?\r\n[Grund: ${reason}]`
            newTitle = 'Honor Up!'
            newDescription = `<@${target.id}> erhält einen Honor!\r\n[Grund: ${reason}]`
            newThumbnail = "https://cdn.discordapp.com/emojis/748176295535443968.webp"
        } else {
            description = `Willst du wirklich <@${target.id}> einen Dishonor geben?\r\n[Grund: ${reason}]`
            newTitle = 'Honor Down!'
            newDescription = `<@${target.id}> erhält einen Dishonor!\r\n[Grund: ${reason}]`
            newThumbnail = "https://cdn.discordapp.com/emojis/748176295132790786.webp"
        }


        const embed = new EmbedBuilder()
            .setTitle('- Honor Menu -')
            .setDescription(description)
            .addFields({
                name: 'Current Honor Level', value: `${theirHonorLevel?.honors ?? 0} ${honor == 1 ? '(**+1**)' : '(**-1**)'}`
            })
            .setThumbnail(target.displayAvatarURL())
        await interaction.update({
            embeds: [embed]
        })

        const newEmbed = new EmbedBuilder()
            .setTitle(newTitle)
            .setDescription(newDescription)
            .setThumbnail(newThumbnail)
        await interaction.followUp({
            embeds: [newEmbed],
            components: [],
        })
    }
}