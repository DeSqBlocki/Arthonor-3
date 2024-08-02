const { EmbedBuilder } = require('discord.js')
const { mClient } = require('../../index')
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
require('dotenv').config()
module.exports = {
    name: 'nutsstats',
    description: 'shows nuts statistic',
    aliases: ['nstat', 'ns'],
    async execute(message, args) {
        const db = mClient.db(process.env.M_DB)
        const nStatsColl = db.collection('nut-stats')
        const stats = await nStatsColl.find({}).sort({ amount: 1 }).toArray()
        let nutMin = {
            count: 0,
            amount: 0
        }
        let nutMax = {
            count: 0,
            amount: 0
        }
        let totalNuts = 0
        let totalCount = 0
        stats.forEach(stat => {
            totalCount += stat.count
            totalNuts += (stat.count * stat.amount)
            if (nutMin.count > stat.count) { nutMin = stat }
            if (nutMax.count < stat.count) { nutMax = stat }
        })
        let nutAvg = totalNuts / totalCount
        const embed = new EmbedBuilder()
            .setTitle("Nut Statistic")
            .setDescription(
                `Total Nut Actions: **${totalCount}**\r\n
                Total Nuts nutted: **${totalNuts}**\r\n
                Nut Average: **${nutAvg.toFixed(3)}**\r\n
                Best Nut: **${nutMax.amount}**\r\n
                Worst Nut: **${nutMin.amount}**`
            )
            .addFields(
                { name: '[0]', value: `x${stats[0].count}`, inline: true },
                { name: '[1]', value: `x${stats[1].count}`, inline: true },
                { name: '[2]', value: `x${stats[2].count}`, inline: true },
                { name: '[3]', value: `x${stats[3].count}`, inline: true },
                { name: '[4]', value: `x${stats[4].count}`, inline: true },
                { name: '[5]', value: `x${stats[5].count}`, inline: true },
                { name: '[6]', value: `x${stats[6].count}`, inline: true },
                { name: '[7]', value: `x${stats[7].count}`, inline: true },
                { name: '[8]', value: `x${stats[8].count}`, inline: true },
                { name: '[9]', value: `x${stats[9].count}`, inline: true }
            )
            .setColor(0x51267)
            .setTimestamp()
            .setThumbnail(message.guild.iconURL())
        await message.reply({
            embeds: [embed]
        })
    }
}