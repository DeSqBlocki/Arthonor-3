const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder } = require('discord.js')
const { mClient } = require('../..')
require('dotenv').config()
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function honorHoner(interaction) {
    const db = mClient.db(process.env.M_DB)
    const honorsColl = db.collection('honors')

    const target = await interaction.options.getUser('target')
    const reason = `[+] ${await interaction.options.getString('reason') ?? 'No reason provided'}`

    const theirHonorLevel = await honorsColl.findOne({ userID: target.id })

    const embed = new EmbedBuilder()
        .setTitle('- Honor Up! -')
        .setDescription(`Willst du wirklich <@${target.id}> einen **Honor** geben?\r\n[Grund: ${reason}]`)
        .addFields({
            name: 'Current Honor Level', value: `${theirHonorLevel?.honors ?? 0} (**+1**)`
        })
        .setThumbnail(target.displayAvatarURL())
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('✔')
                .setCustomId('honor_multi_confirm')
                .setStyle(ButtonStyle.Success)
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel('✖')
                .setCustomId('abort')
                .setStyle(ButtonStyle.Danger)
        )
    await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
    })
}
async function honerDishonor(interaction) {
    const db = mClient.db(process.env.M_DB)
    const honorsColl = db.collection('honors')

    const target = await interaction.options.getUser('target')
    const reason = `[-] ${await interaction.options.getString('reason') ?? 'No reason provided'}`
    const theirHonorLevel = await honorsColl.findOne({ userID: target.id })

    const embed = new EmbedBuilder()
        .setTitle('- Honor Down! -')
        .setDescription(`Willst du wirklich <@${target.id}> einen **Dishonor** geben?\r\n[Grund: ${reason}]`)
        .addFields({
            name: 'Current Honor Level', value: `${theirHonorLevel?.honors ?? 0} (**-1**)`
        })
        .setThumbnail(target.displayAvatarURL())
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('✔')
                .setCustomId('honor_multi_confirm')
                .setStyle(ButtonStyle.Success)
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel('✖')
                .setCustomId('abort')
                .setStyle(ButtonStyle.Danger)
        )
    await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
    })
}
async function honorLeaderboard(interaction) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('◄')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('honors_leaderboard_left')
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel('🧑')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('honors_leaderboard_self')
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel('►')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('honors_leaderboard_right')
        )
    const db = mClient.db(process.env.M_DB)
    const honorsColl = db.collection('honors')
    let skip = 0
    const honorsData = await honorsColl.find({}).sort({ honors: -1 }).skip(skip).limit(5).toArray()
    let fields
    let placements = skip + 1
    honorsData.forEach((data) => {
        fields = (fields ? fields : '') + (`${placements}. <@${data.userID}> : ${data.honors} Honors\r\n`)
    })
    const embed = new EmbedBuilder()
        .setTitle('- Honors Leaderboard -')
        .setThumbnail('https://cdn.discordapp.com/attachments/1152723542836772914/1152940755539722240/pngwing.com.png')
        .setDescription(fields.toString());
    await interaction.editReply({
        embeds: [embed],
        components: [row]
    })
}
async function honorHistory(interaction) {
    var target = interaction.options.getUser('target')
    if (!target) { target = interaction.user }
    const db = mClient.db(process.env.M_DB)
    const reasonsColl = db.collection('honor-reasons')
    var history = await reasonsColl.findOne({ userID: target.id })

    const embed = new EmbedBuilder()
        .setTitle('- Honor History -')
        .setThumbnail(target.displayAvatarURL())

    if (history) {
        let temp = ''
        history.reasons.forEach(reason => {
            temp += reason + '\r\n'
        })
        embed.setDescription(temp)
    }
    await interaction.editReply({ embeds: [embed] })
}
async function honorCheck(interaction) {
    var target = interaction.options.getUser('target')
    if (!target) { target = interaction.user }
    const db = mClient.db(process.env.M_DB)
    const honorsColl = db.collection('honors')
    var honors = await honorsColl.findOne({ userID: target.id })
    honors = honors?.honors ?? 0

    if (!honors) {
        content = 'Choose a goddamn side!'
    } else {
        if (honors === -20) {
            content = 'They are is at max Dishonor Level! <:lowhonor:748176295132790786> <:lowhonor:748176295132790786> <:lowhonor:748176295132790786>\n```' + `You don't get to live a bad life and have good things happen to you. - Arthur M.` + '```'
        } else if (honors === 20) {
            content = 'They are at max Honor Level! <:highhonor:748176295535443968> <:highhonor:748176295535443968> <:highhonor:748176295535443968>'
        } else if (honors > 0) {
            content = 'real good, boah, REAL GOOD! <:highhonor:748176295535443968>'
        } else if (honors < 0) {
            content = 'What happened to Loyalty?! <:lowhonor:748176295132790786>'
        }
    }
    const embed = new EmbedBuilder()
        .setTitle('- Honor Check -')
        .setDescription(`${target} has an Honor Level of **${honors}**!`)
        .setThumbnail(target.displayAvatarURL())
        .addFields({ name: '\u200B', value: `*${content}*` })

    await interaction.editReply({
        embeds: [embed]
    })
}
async function honorMenu(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('- Honor Menu WIP! -')
        .setDescription('- Choose someone from the Select Menu below\r\n- Choose Honor Dishonor, or History\r\n- Confirm your Selection')
        .setThumbnail(interaction.guild.iconURL())
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Honor')
                .setEmoji(`<:honorhigh:748176295535443968>`)
                .setCustomId('honor_menu_honor')
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel('Dishonor')
                .setEmoji(`<:honorlow:748176295132790786>`)
                .setCustomId('honor_menu_dishonor')
                .setStyle(ButtonStyle.Primary)
        )
        .addComponents(
            new ButtonBuilder()
                .setLabel('History')
                .setEmoji('📜')
                .setCustomId('honor_menu_history')
                .setStyle(ButtonStyle.Secondary)
        )
    const select = new ActionRowBuilder()
        .addComponents(
            new UserSelectMenuBuilder()
                .setCustomId('honor_menu_mentionable')
                .setPlaceholder('Select a User')

        )

    await interaction.reply({
        embeds: [embed],
        components: [select, row],
        ephemeral: true
    })
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('honors')
        .setDescription('rund um den honor')
        .addSubcommand(s =>
            s
                .setName('honor')
                .setDescription('honor someone')
                .addUserOption(o => o.setName('target').setDescription('wer wird gehonored?').setRequired(true))
                .addStringOption(o => o.setName('reason').setDescription('reason?'))
        )
        .addSubcommand(s =>
            s
                .setName('dishonor')
                .setDescription('dishonor someone')
                .addUserOption(o => o.setName('target').setDescription('wer wird gehonored?').setRequired(true))
                .addStringOption(o => o.setName('reason').setDescription('reason?'))
        )
        .addSubcommand(s =>
            s
                .setName('check')
                .setDescription("check someone's honor level")
                .addUserOption(o => o.setName('target').setDescription('wer wird gehonored?'))
        )
        .addSubcommand(s =>
            s
                .setName('history')
                .setDescription("check someone's honor history")
                .addUserOption(o => o.setName('target').setDescription('von wem?'))
        )
        .addSubcommand(s =>
            s
                .setName('leaderboard')
                .setDescription("check who's got the most honor")
        )
        .addSubcommand(s =>
            s
                .setName('menu')
                .setDescription('WIP universal honor menu'))
    ,
    async execute(interaction) {
        switch (interaction.options._subcommand) {
            case 'honor':
                honorHoner(interaction)
                break;
            case 'dishonor':
                honerDishonor(interaction)
                break;
            case 'leaderboard':
                await interaction.deferReply()
                honorLeaderboard(interaction)
                break;
            case 'history':
                await interaction.deferReply()
                honorHistory(interaction)
                break;
            case 'check':
                await interaction.deferReply()
                honorCheck(interaction)
                break;
            case 'menu':
                honorMenu(interaction)
                break;
            default:
                break;
        }
    }
}