const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { mClient } = require('../..'); // Adjust the path as needed
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

module.exports = {
    name: 'quotes_leaderboard_right',
    description: 'Navigate right through the quotes leaderboard',
    async execute(interaction) {
        await interaction.deferReply()
        const db = mClient.db(process.env.M_DB)
        const quotesColl = db.collection('quotes')
        const maxValue = await quotesColl.countDocuments({ $and: [{ guildID: interaction.guild.id }, { count: { $gt: 0 } }] })

        let skip = interaction.message.embeds[0].data.fields[0].value.split('.')
        skip = Number(skip[0]) - 6 
        if (skip >= (maxValue - (maxValue % 5))) {
            skip = maxValue - (maxValue % 5)
        }

        const quotesData = await quotesColl.find({ count: { $gt: 0 } }).sort({ count: -1, messageID: -1 }).skip(skip).limit(5).toArray()
        const fields = []

        const guild = await interaction.client.guilds.fetch(interaction.guild.id)
        quotesData.forEach(async (data, index) => {

            let channel = await guild.channels.fetch(data.channelID)
            let message = await channel.messages.fetch(data.messageID)
            await delay(500)
            fields.push({
                name: `\u200b`,
                value: `${skip + index + 1}. [#${data.messageID}](https://discord.com/channels/${data.guildID}/${data.channelID}/${data.messageID})\r\n**by** <@${data.by}>  • ⭐ ${data.count}\r\n${message.content}`
            })
        })
        
        await delay(5000)
        console.log(fields)
        const embed = new EmbedBuilder()
            .setTitle('- Quotes Leaderboard -')
            .setThumbnail('https://cdn.discordapp.com/attachments/1152723542836772914/1152940755539722240/pngwing.com.png')
            .setFields(fields)
            .setColor('#5865F2')  // Discord's blurple color
            .setFooter({ text: 'Use ◄ ► to navigate' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('◄')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('quotes_leaderboard_left')
                    .setDisabled(skip - 6 < 0)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel('X')
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId('abort')
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel('►')
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('quotes_leaderboard_right')
                    .setDisabled(skip + 4 > maxValue)
            )
        await interaction.editReply({
            embeds: [embed],
            components: [row]
        })
    }
};
