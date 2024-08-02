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
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { mClient } = require('../..')
require('dotenv').config()

async function quotesAdd(interaction) {
    const messageLink = await interaction.options.getString('link')
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
        let refMessage = await channel.messages.fetch(msgData.reference.messageId)
        var refData = {
            content: refMessage.content,
            author: await refMessage.author,
            embed: await refMessage.embeds ? 'embed' : null
        }
    }

    const db = mClient.db(process.env.M_DB)
    const quotesColl = db.collection('quotes')
    const found = await quotesColl.findOne({ messageID: messageID })
    if (found) { return await interaction.reply({ content: 'Quote Already in Database', ephemeral: true }) }
    await quotesColl.findOneAndUpdate({ messageID: messageID }, {
        $set: {
            messageID: messageID,
            channelID: channelID,
            guildID: guildID
        }
    }, { upsert: true })

    var description = ''
    if (refData) {
        description += `> ${refData.author}`
        if (refData.embed) {
            description += '*an embed / a command* '
        }
        description += `\r\n↳`
    }
    description += `${msgData.author} ${msgData.content}\r\n\r\n${messageLink}`
    let timestamp = new Date(message.createdTimestamp)
    let footer = timestamp.toDateString().toString()

    const embed = new EmbedBuilder()
        .setThumbnail(msgData.author.displayAvatarURL())
        .setURL(messageLink)
        .setTitle(`Quote #${messageID} Added!`)
        .setDescription(description)
        .setFooter({ text: footer})
    await interaction.reply({ embeds: [embed] })
}
async function quotesRemove(interaction) {

}
async function quotesSearch(interaction) {

}
async function quotesRandom(interaction) {

}
async function quotesLeaderboard(interaction) {

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
                .addUserOption(o => o.setName('target').setDescription('by user')))
        .addSubcommand(s =>
            s
                .setName('leaderboard')
                .setDescription('see the most used quotes')),
    async execute(interaction) {
        switch (interaction.options._subcommand) {
            case 'add':
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
            default:
                break;
        }
    }
}