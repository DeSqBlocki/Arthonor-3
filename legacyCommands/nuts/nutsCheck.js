const { EmbedBuilder } = require('discord.js')
const { mClient } = require('../../index')
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
require('dotenv').config()
module.exports = {
    name: 'checknuts',
    description: 'get nuts',
    aliases: ['chn'],
    async execute(message, args) {
        var target = message.author
        var addressing = `Du hast`
        if (args[0]) {
            if (!args[0].startsWith('<@' || !args[0].endsWith('>'))) { return message.reply('Invalid User Specification') }
            try {
                target = await message.guild.members.fetch(args[0].slice(2, -1))
            } catch (error) {
                return message.reply({
                    content: `User: ${args[0]} nicht gefunden!`
                }).then(async (msg) => { 
                    await delay(4000)
                    message.delete()
                    msg.delete()
                })
            }

            if (target.user.id !== message.author.id) {
                if (!target.user.globalName) {
                    addressing = `${target.user.username} hat`
                } else {
                    addressing = `${target.user.globalName} hat`
                }
            }
        }
        const db = mClient.db(process.env.M_DB)
        const nutsColl = db.collection('nuts')
        var nutsData = await nutsColl.findOne({ userID: target.id })

        let content
        if (!nutsData) {
            content = `${addressing} noch keine Nüsse gesammelt :(`
        } else {
            content = `${addressing} bereits **${nutsData.nuts}** Nüsse gesammelt!`
        }

        const embed = new EmbedBuilder()
            .setTitle('Checknuts!')
            .setThumbnail(target.displayAvatarURL())
            .setDescription(content)

        return message.reply({
            embeds: [embed]
        })
    }
}