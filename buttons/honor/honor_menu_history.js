const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { mClient } = require("../..")
require('dotenv').config()

module.exports = {
    name: 'honor_menu_history',
    description: 'show selected user honor history',
    async execute(interaction) {
        let description = interaction.message.embeds[0].data.description
        const target = await interaction.guild.members.fetch(description.split(' ')[0].slice(2, -1))
        const db = mClient.db(process.env.M_DB)
        const reasonsColl = db.collection('honor-reasons')
        const history = await reasonsColl.findOne({ userID: target.user.id })
    
        const embed = new EmbedBuilder()
            .setTitle('- Honor History -')
            .setDescription(`${target} - ${target.user.globalName ?? target.user.username}`)
            .setThumbnail(target.displayAvatarURL())
            .setFooter({text: 'Um zurückzukehren, wähle einen Nutzer!'})
            if(history){
                let temp = ''
                history.reasons.forEach(reason => {
                    temp += reason + '\r\n'
                })
                embed.setDescription(temp)
            }
            const select = await interaction.message.components[0]
            const row = await interaction.message.components[1]
        
        await interaction.reply({
            embeds: [embed],
            components: [select, row],
            ephemeral: true
        })
    }
}