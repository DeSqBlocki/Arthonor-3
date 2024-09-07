const { EmbedBuilder } = require("discord.js")
const { mClient } = require("../..")
require('dotenv').config()
module.exports = {
    name: 'nuts_leaderboard_self',
    description: 'navigate to your own placement',
    async execute(interaction) {
        const db = mClient.db(process.env.M_DB)
        const nutsColl = db.collection('nuts')

        const self = await nutsColl.find({ userID: interaction.user.id }).toArray()
        const all = await nutsColl.find({ nuts: { $gt: 0 } }).sort({ nuts: -1 }).toArray()

        function findIndex(){
            let index = 0
            for (let i = 0; i < all.length; i++) {
                index++
                if (all[i].nuts === self[0].nuts) {
                    return index
                }
            }
        }
        let selfIndex = findIndex()
        let skip = selfIndex - ( selfIndex % 5)

        const nutsData = await nutsColl.find({ nuts: { $gt: 0 } }).sort({ nuts: -1 }).skip(skip).limit(5).toArray()
        let fields
        nutsData.forEach((data) => {
            skip++
            fields = (fields ? fields : '') + (`${skip}. <@${data.userID}> : ${data.nuts} Nuts\r\n`)
        })
        const embed = new EmbedBuilder()
            .setTitle('Nuts Leaderboard')
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