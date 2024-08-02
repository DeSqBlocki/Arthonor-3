const { Events, ClientVoiceManager } = require("discord.js");
const { getVoiceConnection } = require('@discordjs/voice')
require('dotenv').config()
const { client } = require('../index')
const users_in_afk = new Set();
const delay = ms => new Promise(res => setTimeout(res, ms));
var connected = false;
const playlist = `https://www.youtube.com/playlist?list=PLjSh2s1ASTgsSdjCgFbpo18RAYF_dHf46`

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(oldState, newState) {
        const guild = client.guilds.cache.get(process.env.D_GuildID)
        const afk_channel = await guild.channels.fetch(guild.afkChannelId)
        const real_afk_channel = await guild.channels.fetch(process.env.D_RealTartarosID)
        const user = await guild.members.fetch(newState.id)

        if(user.id === process.env.D_ID) return;

        // if someone enters the official AFK channel, move them to one where we can play music
        if (newState.channelId === afk_channel.id) {
            await delay(1000)
            
            await user.voice.setChannel(real_afk_channel)
            users_in_afk.add(newState.id)
            console.log(`${users_in_afk.size} User(s) in Channel`)

            if (!connected) {
                connected = true;
                await client.distube.voices.join(real_afk_channel)
                await client.distube.play(real_afk_channel, "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                const queue = client.distube.getQueue(guild)
                await queue.setRepeatMode('Queue')
                await queue.setVolume(40)
            }
        }

        // if someone leaves the real AFK channel, remove them from cache but wait for rejoiners, then leave if none are here
        if (oldState.channelId === real_afk_channel.id && oldState.channelId != newState.channelId) {
            users_in_afk.delete(oldState.id)
        }

        if (users_in_afk.size === 0) {
            //leave if empty
            await client.distube.voices.leave(real_afk_channel)
            connected = false;
        }
    }
}