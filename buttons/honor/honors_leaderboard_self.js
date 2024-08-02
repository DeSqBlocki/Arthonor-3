const { EmbedBuilder } = require("discord.js")
const { mClient } = require("../..")
require('dotenv').config()
module.exports = {
    name: 'honors_leaderboard_self',
    description: 'navigate to your own placement',
    async execute(interaction) {
        const db = mClient.db(process.env.M_DB)
        const honorsColl = db.collection('honors')

        const self = await honorsColl.find({ userID: interaction.user.id }).toArray()
        const all = await honorsColl.find().sort({ honors: -1 }).toArray()

        function findIndex(){
            let index = 0
            for (let i = 0; i < all.length; i++) {
                index++
                if (all[i].honors === self[0].honors) {
                    return index
                }
            }
        }
        let selfIndex = findIndex()
        let skip = selfIndex - ( selfIndex % 5)

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