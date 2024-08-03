/*
Add
Delete
Random
Random By Person
Direct Search by ID

Random By Year?
List?
Counter (Leaderboard?)
*/
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder } = require('discord.js')
const { mClient } = require('../..')
require('dotenv').config()

async function quotesAdd(interaction) {
    const messageLink = await interaction.options.getString('link')
    //regex for message link
    const regex = /^https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+$/

    if (!messageLink.match(regex)) {
        return await interaction.editReply({
            content: `Invalid URL`,
            ephemeral: true
        })
    }

    let temp = messageLink.split('/')
    let messageID = temp[temp.length - 1]
    let channelID = temp[temp.length - 2]
    let guildID = temp[temp.length - 3]

    const guild = await interaction.client.guilds.fetch(guildID)
    const channel = await guild.channels.fetch(channelID)
    const message = await channel.messages.fetch(messageID)

    var msgData = {
        content: message.content,
        author: await message.author,
        reference: await message.reference,
        embed: await message.embeds ? 'embed' : null
    } // debug
    if (msgData.reference) {
        let refGuild = await interaction.client.guilds.fetch(msgData.reference.guildId)
        let refChannel = await refGuild.channels.fetch(msgData.reference.channelId)
        let refMessage = await refChannel.messages.fetch(msgData.reference.messageId)


        var refData = {
            content: refMessage.content,
            author: await refMessage.author,
            embed: await refMessage.embeds.length > 0 ? 'embed' : null
        }
    }

    const db = mClient.db(process.env.M_DB)
    const quotesColl = db.collection('quotes')
    const found = await quotesColl.findOne({ messageID: messageID })
    if (found) { return await interaction.editReply({ content: 'Quote Already in Database', ephemeral: true }) }
    await quotesColl.findOneAndUpdate({ messageID: messageID }, {
        $set: {
            messageID: messageID,
            channelID: channelID,
            guildID: guildID,
            by: msgData.author.id,
            count: 0
        }
    }, { upsert: true })

    var description = ''
    if (refData) {
        description += `> ${refData.author}`
        if (refData.embed) {
            description += '*an embed / a command* '
        } else {
            description += refData.content
        }
        description += `\r\n↳`
    }
    description += `${msgData.author} ${msgData.content}\r\n\r\n${messageLink}`
    let timestamp = new Date(message.createdTimestamp)
    let footer = timestamp.toDateString().toString()

    const embed = new EmbedBuilder()
        .setThumbnail(msgData.author.displayAvatarURL())
        .setURL(messageLink)
        .setTitle(`- Quote Added! -`)
        .setDescription(description)
        .setFooter({ text: (footer + ' #' + messageID) })
    await interaction.editReply({ embeds: [embed] })
}
async function quotesRemove(interaction) {
    const id = await interaction.options.getString('id')

    const db = mClient.db(process.env.M_DB)
    const quotesColl = db.collection('quotes')
    const found = await quotesColl.findOne({ messageID: id })
    if (!found) { return await interaction.reply({ content: 'ID not found!', ephemeral: true }) }

    await quotesColl.deleteOne({ messageID: id })

    return interaction.reply({ content: 'Quote successfully removed!', ephemeral: true })
}
async function quotesSearch(interaction) {
    const id = interaction.options.getString("id")
    const db = mClient.db(process.env.M_DB)
    const quotesColl = db.collection('quotes')
    const found = await quotesColl.findOne({ messageID: id })
    if (!found) { return await interaction.reply({ content: 'ID not found!', ephemeral: true }) }

    
    const guild = await interaction.client.guilds.fetch(found.guildID)
    const channel = await guild.channels.fetch(found.channelID)
    const message = await channel.messages.fetch(found.messageID)

    var msgData = {
        content: message.content,
        author: await message.author,
        reference: await message.reference,
        embed: await message.embeds ? 'embed' : null
    } // debug

    quotesColl.findOneAndUpdate({
        messageID: found.messageID
    },{
        $inc: { count: 1}
    },{
        upsert: true
    })

    if (msgData.reference) {
        let refMessage = await channel.messages.fetch(msgData.reference.messageId)
        var refData = {
            content: refMessage.content,
            author: await refMessage.author,
            embed: await refMessage.embeds.length > 0 ? 'embed' : null
        }
    }

    var description = ''
    if (refData) {
        description += `> ${refData.author}`
        if (refData.embed) {
            description += '*an embed / a command* '
        } else {
            description += refData.content
        }
        description += `\r\n↳`
    }
    let messageLink = `https://discord.com/channels/${found.guildID}/${found.channelID}/${found.messageID}`
    description += `${msgData.author} ${msgData.content}\r\n\r\n${messageLink}`
    let timestamp = new Date(message.createdTimestamp)
    let footer = timestamp.toDateString().toString()

    const embed = new EmbedBuilder()
        .setThumbnail(msgData.author.displayAvatarURL())
        .setURL(messageLink)
        .setTitle(`- Quote Found! -`)
        .setDescription(description)
        .setFooter({ text: (footer + ' #' + found.messageID) })
    await interaction.reply({ embeds: [embed] })

}
async function quotesRandom(interaction) {
    var user = interaction.options.getUser("by")
    const db = mClient.db(process.env.M_DB)
    const quotesColl = db.collection('quotes')
    var rdm
    if(user){
        rdm = await quotesColl.aggregate([
            { 
                $match: { by: user.id},
            },{
                $sample: { size: 1 } 
            }
        ]).toArray()
    } else {
        rdm = await quotesColl.aggregate([
            { 
                $sample: { size: 1 } 
            }
        ]).toArray()
    }
    const found = rdm[0]
    if (!found) { return await interaction.reply({ content: 'Database Empty', ephemeral: true }) }
    const guild = await interaction.client.guilds.fetch(found.guildID)
    const channel = await guild.channels.fetch(found.channelID)
    const message = await channel.messages.fetch(found.messageID)

    var msgData = {
        content: message.content,
        author: await message.author,
        reference: await message.reference,
        embed: await message.embeds ? 'embed' : null
    } // debug

    quotesColl.findOneAndUpdate({
        messageID: found.messageID
    },{
        $inc: { count: 1}
    },{
        upsert: true
    })

    if (msgData.reference) {
        let refMessage = await channel.messages.fetch(msgData.reference.messageId)
        var refData = {
            content: refMessage.content,
            author: await refMessage.author,
            embed: await refMessage.embeds.length > 0 ? 'embed' : null
        }
    }

    var description = ''
    if (refData) {
        description += `> ${refData.author}`
        if (refData.embed) {
            description += '*an embed / a command* '
        } else {
            description += refData.content
        }
        description += `\r\n↳`
    }
    let messageLink = `https://discord.com/channels/${found.guildID}/${found.channelID}/${found.messageID}`
    description += `${msgData.author} ${msgData.content}\r\n\r\n${messageLink}`
    let timestamp = new Date(message.createdTimestamp)
    let footer = timestamp.toDateString().toString()

    const embed = new EmbedBuilder()
        .setThumbnail(msgData.author.displayAvatarURL())
        .setURL(messageLink)
        .setTitle(`- Quote Found! -`)
        .setDescription(description)
        .setFooter({ text: (footer + ' #' + found.messageID) })
    await interaction.reply({ embeds: [embed] })
}
async function quotesList(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('- Quotes List! -')
        .setDescription('- Choose someone below to filter by User')
        .setThumbnail(interaction.guild.iconURL())
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setEmoji(`◀`)
                .setCustomId('quotes_list_left')
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new ButtonBuilder()
                .setEmoji(`❌`)
                .setCustomId('abort')
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new ButtonBuilder()
                .setEmoji(`▶`)
                .setCustomId('quotes_list_right')
                .setStyle(ButtonStyle.Primary)
        )
        
    const select = new ActionRowBuilder()
        .addComponents(
            new UserSelectMenuBuilder()
                .setCustomId('quotes_list_mentionable')
                .setPlaceholder('Filter by User')
        )

    await interaction.reply({
        embeds: [embed],
        components: [select, row],
        ephemeral: true
    })



}
async function quotesLeaderboard(interaction) {
    // need to add count to quotes
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('quotes')
        .setDescription('quoten pfoten')
        .addSubcommand(s =>
            s
                .setName('add')
                .setDescription('add a new quote')
                .addStringOption(o => o.setName('link').setDescription('insert message link').setRequired(true)))
        .addSubcommand(s =>
            s
                .setName('remove')
                .setDescription('remove a quote')
                .addStringOption(o => o.setName('id').setDescription('insert message ID').setRequired(true)))
        .addSubcommand(s =>
            s
                .setName('search')
                .setDescription('search by ID')
                .addStringOption(o => o.setName('id').setDescription('insert message ID').setRequired(true)))
        .addSubcommand(s =>
            s
                .setName('random')
                .setDescription('get a random quote')
                .addUserOption(o => o.setName('by').setDescription('by user')))
        .addSubcommand(s =>
            s
                .setName('leaderboard')
                .setDescription('see the most used quotes'))
        .addSubcommand(s =>
            s
                .setName('list')
                .setDescription('[ADMIN] list all quotes')),
    async execute(interaction) {
        switch (interaction.options._subcommand) {
            case 'add':
                await interaction.deferReply()
                quotesAdd(interaction)
                break;
            case 'remove':
                quotesRemove(interaction)
                break;
            case 'search':
                quotesSearch(interaction)
                break;
            case 'random':
                quotesRandom(interaction)
                break;
            case 'leaderboard':
                quotesLeaderboard(interaction)
                break;
            case 'list':
                quotesList(interaction)
                break;
            default:
                break;
        }
    }
}