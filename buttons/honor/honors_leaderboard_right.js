const { EmbedBuilder } = require("discord.js")
const { mClient } = require("../..")
require('dotenv').config()
module.exports = {
    name: 'honors_leaderboard_right',
    description: 'navigate a page down',
    async execute(interaction) {
        const db = mClient.db(process.env.M_DB)
        const honorsColl = db.collection('honors')
        const max = await honorsColl.countDocuments()
        let skip = interaction.message.embeds[0].data.description.split('.')
        skip = Number(skip[0]) +4
        if (skip >= (max - (max % 5))) {
            skip = max - (max % 5)
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
            .setDescription(fields.toString())
            .setColor('#5865F2')  // Discord's blurple color
        .setFooter({ text: 'Use ◄ ► to navigate' });
        await interaction.update({
            embeds: [embed],
            components: [interaction.message.components[0]]
        })
    }
}