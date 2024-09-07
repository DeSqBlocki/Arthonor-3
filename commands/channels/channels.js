const { SlashCommandBuilder, Events } = require('discord.js')
const { mClient } = require('../..')
require('dotenv').config()

async function channelSet(interaction) {
    const channel = interaction.options.getChannel('channel')
    const purpose = interaction.options.getString('purpose')
    const db = mClient.db(process.env.DB)
    const channelColl = db.collection('channels')

    await channelColl.findOneAndUpdate({
        $and: [{ guildID: channel.guild.id }, { purpose: purpose }]
    }, {
        $set: {
            guildID: channel.guild.id,
            purpose: purpose,
            channelID: channel.id
        }
    }, {
        upsert: true
    })

    return await interaction.editReply({
        content: `Set <#${channel.id}> as ${purpose} channel!`, ephemeral: true
    })
}
async function channelSimulate(interaction) {
    const purpose = interaction.options.getString('purpose')
    switch (purpose) {
        case 'birthday':
            await interaction.client.emit('Birthday', interaction.member)
            break;
        case 'wge':
            // For Future WGE Use
            break;
        case 'welcome':
            await interaction.client.emit(Events.GuildMemberAdd, interaction.member)
            break;
        case 'logs':
            // For Future Log Use
            break;
        default:
            break;
    }
    return interaction.reply({ content: 'Done.', ephemeral: true })
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('channels')
        .setDescription('rund um den honor')
        .addSubcommand(s =>
            s
                .setName('set')
                .setDescription('set a channel for a specific purpose')
                .addStringOption(o =>
                    o.setName('purpose').setDescription('set the purpose').setRequired(true).addChoices({
                        name: 'birthday',
                        value: 'birthday'
                    }, {
                        name: 'welcome',
                        value: 'welcome'
                    }, {
                        name: 'logs',
                        value: 'logs'
                    }, {
                        name: 'wge',
                        value: 'wge'
                    }))
                .addChannelOption(c =>
                    c.setName('channel').setDescription('choose a channel').setRequired(true)
                )
        )
        .addSubcommand(s =>
            s
                .setName('simulate')
                .setDescription('simulate a specific channel event')
                .addStringOption(o =>
                    o.setName('purpose').setDescription('set the purpose').setRequired(true).addChoices({
                        name: 'birthday',
                        value: 'birthday'
                    }, {
                        name: 'welcome',
                        value: 'welcome'
                    }, {
                        name: 'logs',
                        value: 'logs'
                    }, {
                        name: 'wge',
                        value: 'wge'
                    }))
        )
    ,
    async execute(interaction) {
        switch (interaction.options._subcommand) {
            case 'set':
                await interaction.deferReply()
                channelSet(interaction)
                break;
            case 'simulate':
                channelSimulate(interaction)
                break;
            default:
                break;
        }
    }
}