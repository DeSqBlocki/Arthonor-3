const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { mClient } = require('../../index')
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
require('dotenv').config()
module.exports = {
    name: 'nutsleaderboard',
    description: 'show nuts leaderboard',
    aliases: ['nl', 'tn', 'topnuts'],
    async execute(message, args) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('◄')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('nuts_leaderboard_left')
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel('🧑')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('nuts_leaderboard_self')
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel('►')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('nuts_leaderboard_right')
            )
        const db = mClient.db(process.env.M_DB)
        const nutsColl = db.collection('nuts')
        let skip = 0
        const nutsData = await nutsColl.find({ nuts: { $gt: 0 } }).sort({ nuts: -1 }).skip(skip).limit(5).toArray()
        let fields
        let placements = skip + 1
        nutsData.forEach((data) => {
            fields = (fields ? fields : '') + (`${placements}. <@${data.userID}> : ${data.nuts} Nuts\r\n`)
        })
        const embed = new EmbedBuilder()
            .setTitle('Nuts Leaderboard')
            .setThumbnail('https://cdn.discordapp.com/attachments/1152723542836772914/1152940755539722240/pngwing.com.png')
            .setDescription(fields.toString());
        await message.reply({
            embeds: [embed],
            components: [row]
        })
    }
}
