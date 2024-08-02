const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { configDotenv } = require("dotenv");
configDotenv

async function musicJoin(interaction) {
    const voiceChannel = await interaction.guild.channels.fetch(process.env.D_RealTartarosID)
    await interaction.client.distube.voices.join(voiceChannel)
    await voiceChannel.guild.members.me.edit({ mute: false })
    await interaction.reply({
        content: `Joined ${voiceChannel}`,
        ephemeral: true
    })
}
async function musicLeave(interaction) {
    const voiceChannel = await interaction.guild.channels.fetch(process.env.D_RealTartarosID)
    await interaction.client.distube.voices.leave(voiceChannel)
    await interaction.reply({
        content: `Left ${voiceChannel}`,
        ephemeral: true
    })
}
async function musicPlay(interaction) {
    const url = await interaction.options.getString('url')
    const regex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/gm
    const voiceChannel = await interaction.member.voice.channel

    if (!url.match(regex)) {
        return await interaction.editReply({
            content: `Invalid URL`,
            ephemeral: true
        })
    }
    await interaction.client.distube.play(voiceChannel, url)
    const queue = interaction.client.distube.getQueue(interaction.guild)
    const { name, thumbnail } = queue.songs[0]
    const embed = new EmbedBuilder()
        .setThumbnail(thumbnail)
        .setTitle(`Added ${name} to Queue`)
        .setURL(url)
    await interaction.editReply({
        embeds: [embed]
    })
}
async function musicVolume(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild)
    if (!queue) {
        return await interaction.reply({
            content: `There is nothing in the queue right now!`,
            ephemeral: true
        })
    }
    const volume = await interaction.options.getNumber('volume')
    queue.setVolume(volume)
    await interaction.reply({
        content: `Set Volume to ${volume}%`,
        ephemeral: true
    })
}
async function musicQueue(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild)
    if (!queue) {
        return await interaction.reply({
            content: `There is nothing in the queue right now!`,
            ephemeral: true
        })
    }
    const songs = queue.songs.map((song, i) => `${i === 0 ? 'Playing:' : `${i}.`} ${song.name} - \`${song.formattedDuration}\``)
        .join('\n')

        const embed = new EmbedBuilder()
        .setTitle(`Server Queue`)
        .setDescription(songs.toString())
    await interaction.reply({
        embeds: [ embed ]
    })
}
async function musicSkip(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guild)
    if (!queue) {
        return await interaction.reply({
            content: `There is nothing in the queue right now!`,
            ephemeral: true
        })
    }
    try {
        const song = await queue.skip()
        await interaction.reply({
            content: `Skipped! Now playing:\n${song.name}`
        })
    } catch (e) {
        await interaction.reply({
            content: e
        })
    }
}
module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('handles all music related commands')
        .addSubcommand(s =>
            s
                .setName('play')
                .setDescription('plays music')
                .addStringOption(o => o.setName('url').setDescription('youtube url').setRequired(true))
        ).addSubcommand(s =>
            s
                .setName('join')
                .setDescription('join default music channel')
        ).addSubcommand(s =>
            s
                .setName('leave')
                .setDescription('leave default music channel')
        ).addSubcommand(s =>
            s
                .setName('volume')
                .setDescription('adjust music volume (default: 50%)')
                .addNumberOption(o => o.setName('volume').setDescription('choose volume').addChoices(
                    { name: '100%', value: 100 },
                    { name: '90%', value: 90 },
                    { name: '80%', value: 80 },
                    { name: '70%', value: 70 },
                    { name: '60%', value: 60 },
                    { name: '50%', value: 50 },
                    { name: '40%', value: 40 },
                    { name: '30%', value: 30 },
                    { name: '20%', value: 20 },
                    { name: '10%', value: 10 },
                    { name: '0%', value: 0 },
                ).setRequired(true))
        ).addSubcommand(s =>
            s
                .setName('queue')
                .setDescription('show current queue')
        ).addSubcommand(s =>
            s
                .setName('skip')
                .setDescription('skip current song')
        ),
    async execute(interaction) {
        const subcommand = await interaction.options._subcommand
        switch (subcommand) {
            case 'play':
                interaction.deferReply()
                musicPlay(interaction)
                break;
            case 'join':
                musicJoin(interaction)
                break;
            case 'leave':
                musicLeave(interaction)
                break;
            case 'volume':
                musicVolume(interaction)
                break;
            case 'queue':
                musicQueue(interaction)
                break;
            case 'skip':
                musicSkip(interaction)
                break;
            default:
                break;
        }
    }
}