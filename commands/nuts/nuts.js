const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { mClient } = require('../..')
require('dotenv').config()
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function nutsGive(interaction) {
    async function tradeWindow(buttonID1, buttonID2) {
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
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('✔')
                    .setCustomId(buttonID1)
                    .setStyle(ButtonStyle.Success)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel('✖')
                    .setCustomId(buttonID2)
                    .setStyle(ButtonStyle.Danger)
            )
        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        })
    }
    const from = interaction.user
    const to = await interaction.options.getUser('target')
    var amount = await interaction.options.getNumber('amount')

    const db = mClient.db(process.env.M_DB)
    const nutsColl = db.collection('nuts')
    const yourBalance = await nutsColl.findOne({ userID: from.id })
    const theirBalance = await nutsColl.findOne({ userID: to.id })
    if (amount <= 0) {
        amount = yourBalance.nuts
        return tradeWindow('nuts_give_fake', 'abort')
    }
    if (yourBalance.nuts < amount) {
        return await interaction.reply({
            content: 'Du kannst nicht mehr geben als du hast!',
            ephemeral: true
        })
    }
    return tradeWindow('nuts_give_confirm', 'abort')
}
async function nutsCheck(interaction) {
    let target = interaction.options.getUser('target')
    let addressing
    if (!target) {
        target = interaction.user
        addressing = `Du hast`
    }

    if (!target.globalName) {
        addressing = `${target.username} hat`
    } else {
        addressing = `${target.globalName} hat`
    }

    const db = mClient.db(process.env.M_DB)
    const nutsColl = db.collection('nuts')
    const nutsData = await nutsColl.findOne({ userID: target.id })

    let content
    if (!nutsData) {
        content = `${addressing} noch keine Nüsse gesammelt :(`
    } else {
        content = `${addressing} bereits **${nutsData.nuts}** Nüsse gesammelt!`
    }

    let title = 'Zähle Nüsse'
    const embed = new EmbedBuilder()
    for (let i = 0; i < 4; i++) {
        embed.setTitle(title)
        await interaction.editReply({
            embeds: [embed]
        })
        title = title + ' .'
        await delay(500);
    }
    embed
        .setTitle(content)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/628/628206.png')

    await interaction.editReply({
        embeds: [embed]
    })
}
async function nutsLeaderboard(interaction) {
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
        .setDescription(fields.toString())
        .setColor('#5865F2')  // Discord's blurple color
        .setFooter({ text: 'Use ◄ ► to navigate' });
    await interaction.editReply({
        embeds: [embed],
        components: [row]
    })
}
async function nutsStats(interaction) {
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
        .setThumbnail(interaction.guild.iconURL())
    await interaction.editReply({
        embeds: [embed]
    })
}
async function nutsCooldown(interaction) {
    const db = mClient.db(process.env.M_DB)
    const nutsColl = db.collection('cooldown')
    const cooldown = await nutsColl.findOne({ userID: interaction.user.id })

    let content = `Du kannst wieder nussen! :)`
    let thumbnail = 'https://cdn-icons-png.flaticon.com/512/7451/7451659.png'
    let title = 'Go Nuts!'

    let date = (Date.now() / 1000)
    if (cooldown.cooldown > date) {
        content = `<t:${cooldown.cooldown}:R> kannst du wieder nussen! ;)`
        thumbnail = 'https://cdn.discordapp.com/attachments/1152723542836772914/1152987472788193361/No-nuts-PhotoRoom.png-PhotoRoom.png'
        title = 'To Nut or Not to Nut...'
    }

    const embed = new EmbedBuilder()
        .setThumbnail(thumbnail)
        .setTitle(title)
        .setDescription(content)

    await interaction.editReply({
        embeds: [embed]
    })
}
async function nutsNut(interaction) {
    const db = mClient.db(process.env.M_DB)
    const nutsColl = db.collection('nuts')
    const cdColl = db.collection('cooldown')

    const cdData = await cdColl.findOne({ userID: interaction.user.id })
    const embed = new EmbedBuilder()
        .setThumbnail('https://cdn.discordapp.com/attachments/1152723542836772914/1152991361113538621/png-transparent-subscription-box-label-bag-mysterious-miscellaneous-purple-blue-thumbnail-PhotoRoom.png-PhotoRoom.png')

    let content
    const images = {
        "high": "https://as2.ftcdn.net/v2/jpg/02/24/65/39/1000_F_224653943_r3xltiwJsK6am0mGZE5DTWk1yocUwHLd.jpg",
        "normal": 'https://c8.alamy.com/comp/PPPBXK/surprised-pecan-nuts-pile-on-plate-cartoon-PPPBXK.jpg',
        "low": 'https://as2.ftcdn.net/v2/jpg/02/24/65/37/1000_F_224653769_ceJk0tq9UT1hSu5FIVUi7BeaN4ucSZGv.jpg',
        "none": 'https://cdn4.vectorstock.com/i/1000x1000/87/08/afraid-pecan-nuts-pile-on-plate-cartoon-vector-22028708.jpg',
        "onCD": 'https://cdn.discordapp.com/attachments/1152723542836772914/1152987472788193361/No-nuts-PhotoRoom.png-PhotoRoom.png'
    }
    let image
    if (!cdData || cdData.cooldown < (Date.now() / 1000)) {
        let cd = Math.floor((Date.now() + 3600000) / 1000)
        await cdColl.findOneAndUpdate({
            userID: interaction.user.id
        }, {
            $set: { cooldown: cd }
        }, {
            upsert: true
        })

        const amount = Math.floor(Math.random() * 10)

        await nutsColl.findOneAndUpdate({
            userID: interaction.user.id
        }, {
            $inc: { nuts: amount }
        }, {
            upsert: true
        })

        if (amount) {
            content = `Du hast **${amount}** Nüsse bekommen!`
            if (amount > 8) {
                image = images["high"]
            } else if (amount > 4) {
                image = images["normal"]
            } else {
                image = images["low"]
            }
        } else {
            content = `Du hast leider keine Nüsse bekommen :(`
            image = images["none"]
        }
    } else {
        content = `Du kannst erst <t:${Math.floor(cdData?.cooldown)}:R> wieder nussen :(`
        image = images["onCD"]
        await delay(1000)
        embed.setDescription(content)
        embed.setThumbnail(image)
        return await interaction.editReply({
            embeds: [embed]
        })
    }

    await interaction.editReply({
        embeds: [embed]
    })
    await delay(1000)
    embed.setThumbnail('https://i.pinimg.com/originals/9d/58/37/9d5837c6f0cb8b18be6ddd1e2742472a.gif')
    await interaction.editReply({
        embeds: [embed]
    })

    await delay(1000)
    embed.setDescription(content)
    embed.setThumbnail(image)
    await interaction.editReply({
        embeds: [embed]
    })


}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('nuts')
        .setDescription('rund um die nuss')
        .addSubcommand(s =>
            s
                .setName('give')
                .setDescription('gib nuss!!')
                .addUserOption(o => o.setName('target').setDescription('wer bekommt da nuts?').setRequired(true))
                .addNumberOption(o => o.setName('amount').setDescription('wie viele?').setRequired(true)))
        .addSubcommand(s =>
            s
                .setName('check')
                .setDescription('check out deez nuts')
                .addUserOption(o => o.setName('target').setDescription('check out those nuts!')))
        .addSubcommand(s =>
            s
                .setName('leaderboard')
                .setDescription('wer hat die dicksten Nüsse?'))
        .addSubcommand(s =>
            s
                .setName('stats')
                .setDescription('wie viele Nüsse wurden genusst, Genosse?'))
        .addSubcommand(s =>
            s
                .setName('cooldown')
                .setDescription('wie lange bis ich nussen kann?'))
        .addSubcommand(s =>
            s
                .setName('nut')
                .setDescription('willst du nuss?')),
    async execute(interaction) {
        switch (interaction.options._subcommand) {
            case 'give':
                nutsGive(interaction)
                break;
            case 'check':
                await interaction.deferReply()
                nutsCheck(interaction)
                break;
            case 'leaderboard':
                await interaction.deferReply()
                nutsLeaderboard(interaction)
                break;
            case 'stats':
                await interaction.deferReply()
                nutsStats(interaction)
                break;
            case 'cooldown':
                await interaction.deferReply()
                nutsCooldown(interaction)
                break;
            case 'nut':
                await interaction.deferReply()
                nutsNut(interaction)
                break;
            default:
                break;
        }
    }
}