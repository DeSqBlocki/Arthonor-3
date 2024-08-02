const { EmbedBuilder } = require("discord.js")
const { mClient } = require("../..")
module.exports = {
    name: 'nuts_give_fake',
    description: 'fake it',
    async execute(interaction) {
        const from = interaction.user
        let temp = await interaction.message.embeds[0].description.split(' ')
        const amount = Number(temp[3].split('**')[1])
        const to = await interaction.message.guild.members.fetch(temp[6].slice(2,-1))

        const db = mClient.db(process.env.M_DB)
        const nutsColl = db.collection('nuts')

        const yourBalance = await nutsColl.findOne({ userID: from.id })
        const theirBalance = await nutsColl.findOne({ userID: to.id })

        const embed = new EmbedBuilder()
        .setTitle('Gib Nuss!')
        .setDescription(`Willst du wirklich **${amount}** Nüsse an <@${to.id}> senden?`)
        .addFields(
            { name: `Your Current Balance`, value: `${yourBalance.nuts} (**-${amount}**)`, inline: true },
            { name: `Your New Balance`, value: `${yourBalance.nuts - amount}`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: `Their Current Balance`, value: `${theirBalance.nuts} (**+${amount}**)`, inline: true },
            { name: `Their New Balance`, value: `${theirBalance.nuts + amount}`, inline: true }
        )
        .setThumbnail(to.displayAvatarURL())
            await interaction.update({
                embeds: [ embed ]
            })

        const newEmbed = new EmbedBuilder()
        .setTitle('Du Fieser Gauner!')
        .setDescription(`Yee Haw! Was tust du hier?!`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        await interaction.followUp({
            embeds: [ newEmbed ],
            components: [],
        })
    }
}