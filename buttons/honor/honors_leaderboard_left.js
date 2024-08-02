const { EmbedBuilder } = require("discord.js")
const { mClient } = require("../..")
require('dotenv').config()

module.exports = {
    name: 'honors_leaderboard_left',
    description: 'navigate a page up',
    async execute(interaction) {
        const db = mClient.db(process.env.M_DB)
        const honorsColl = db.collection('honors')
        const min = 0
        let skip = interaction.message.embeds[0].data.description.split('.')
        skip = Number(skip[0]) - 6
        skip = skip - ( skip % 5)
        if ( skip < 4){
            skip = 0
        }
        const honorsData = await honorsColl.find().sort({ honors: -1 }).skip(skip).limit(5).toArray()
        let fields
        honorsData.forEach((data) => {
            skip++
            fields = (fields ? fields : '') + (`${skip}. <@${data.userID}> : ${data.honors} Honors\r\n`)
        })
        const embed = new EmbedBuilder()
            .setTitle('Honors Leaderboard')
            .setThumbnail('https://cdn.discordapp.com/attachments/1152723542836772914/1152940755539722240/pngwing.com.png')
            .setDescription(fields.toString());
        await interaction.update({
            embeds: [embed],
            components: [interaction.message.components[0]]
        })
    }
}