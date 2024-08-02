const { EmbedBuilder } = require('discord.js')
const { mClient } = require('../../index')
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
require('dotenv').config()
module.exports = {
    name: 'givenuts',
    description: 'give nuts',
    aliases: ['gn'],
    async execute(message, args) {
        const from = message.author
        if (args[0] == `<@${message.author.id}>` || !args[0]) {
            return message.reply({
                content: "Du musst einen anderen User erwähnen"
            }).then(async (msg) => {
                await delay(4000)
                message.delete()
                msg.delete()
            })
        }
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
        const to = target

        try {
            var amount = Number(args[1])
        } catch (error) {
            console.log(error)
            return message.reply({
                content: 'Du musst eine Menge angeben!'
            }).then(async (msg) => {
                await delay(4000)
                message.delete()
                msg.delete()
            })
        }
        if (!amount) {
            return message.reply({content : 'Danke für nichts, du Hu-'})
        }

        const db = mClient.db(process.env.M_DB)
        const nutsColl = db.collection('nuts')
        const yourBalance = await nutsColl.findOne({ userID: from.id })
        if (amount <= 0) {
            return await message.reply({
                content: `Hier wird nicht geklaut >:(\r\nDas gibt **${yourBalance.nuts}** Abzug!`
            })
        }
        if (yourBalance.nuts < amount) {
            return await message.reply({
                content: 'Du kannst nicht mehr geben als du hast!',
                ephemeral: true
            })
        }
        var content = `Du sendest **${amount}** Nüsse an <@${target.id}>`
        
        if (amount == 1) {
            content = `Du sendest **eine** Nuss an <@${target.id}>`
        }
        await nutsColl.findOneAndUpdate({ userID: from.id }, { $inc: { nuts: -amount } }, { upsert: true })
        await nutsColl.findOneAndUpdate({ userID: to.id }, { $inc: { nuts: +amount } }, { upsert: true })

        const embed = new EmbedBuilder()
            .setTitle('Gib Nuss!')
            .setDescription(content)
            .setThumbnail(target.displayAvatarURL())
        return message.reply({ embeds: [embed] })
    }
}