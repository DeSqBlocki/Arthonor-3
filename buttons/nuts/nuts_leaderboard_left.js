const { EmbedBuilder } = require("discord.js")
const { mClient } = require("../..")
require('dotenv').config()

module.exports = {
    name: 'nuts_leaderboard_left',
    description: 'navigate a page up',
    async execute(interaction) {
        const db = mClient.db(process.env.M_DB)
        const nutsColl = db.collection('nuts')
        const min = 0
        let skip = interaction.message.embeds[0].data.description.split('.')
        skip = Number(skip[0]) - 6
        skip = skip - ( skip % 5)
        if ( skip < 4){
            skip = 0
        }
        const nutsData = await nutsColl.find({ nuts: { $gt: 0 } }).sort({ nuts: -1 }).skip(skip).limit(5).toArray()
        let fields
        nutsData.forEach((data) => {
            skip++
            fields = (fields ? fields : '') + (`${skip}. <@${data.userID}> : ${data.nuts} Nuts\r\n`)
        })
        const embed = new EmbedBuilder()
            .setTitle('Nuts Leaderboard')
            .setThumbnail('https://cdn.discordapp.com/attachments/1152723542836772914/1152940755539722240/pngwing.com.png')
            .setDescription(fields.toString());
        await interaction.update({
            embeds: [embed],
            components: [interaction.message.components[0]]
        })
    }
}