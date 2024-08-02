const { EmbedBuilder } = require('discord.js')
const { mClient } = require('../../index')
require('dotenv').config()
module.exports = {
    name: 'nutsCooldown',
    description: 'shows nut cooldown',
    aliases: ['ncd'],
    async execute(message, args) {
        const db = mClient.db(process.env.M_DB)
        const nutsColl = db.collection('cooldown')
        const cooldown = await nutsColl.findOne({ userID: message.author.id })

        let content = `Du kannst wieder nussen! :)`
        let thumbnail = 'https://cdn-icons-png.flaticon.com/512/7451/7451659.png'
        let title = 'Go Nuts!'
        if (cooldown) {
            content = `<t:${cooldown.cooldown}:R> kannst du wieder nussen! ;)`
            thumbnail = 'https://cdn.discordapp.com/attachments/1152723542836772914/1152987472788193361/No-nuts-PhotoRoom.png-PhotoRoom.png'
            title = 'To Nut or Not to Nut...'
        }

        const embed = new EmbedBuilder()
            .setThumbnail(thumbnail)
            .setTitle(title)
            .setDescription(content)

        await message.reply({
            embeds: [embed]
        })
    }
}