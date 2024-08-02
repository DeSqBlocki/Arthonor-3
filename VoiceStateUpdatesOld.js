const { Events, ActivityType } = require('discord.js')
require('dotenv').config()
const { client } = require('./index')
const { RepeatMode } = require('distube')
const delay = ms => new Promise(res => setTimeout(res, ms));
var usersInTartaros = new Set()
var joined = false
const playlist = `https://www.youtube.com/playlist?list=PLjSh2s1ASTgsSdjCgFbpo18RAYF_dHf46`

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(oldUser, newUser) {
        const guild = client.guilds.cache.get(newUser.guild.id)
        const tartarosChannel = await guild.channels.fetch(process.env.D_TartarosID)
        
        if (newUser.channelId === tartarosChannel.id && oldUser.channelId != newUser.channelId) {
            if (newUser.id === '1152718975529140265') {
                console.log('Bot joined Tartaros!')
                await newUser.setMute(false)
                //await newUser.setSuppress(false)
                console.log(newUser)
            }

            usersInTartaros.add(newUser.id)
            console.log(`${usersInTartaros.size} User(s) in Tartaros`)

            if (!joined) {
                joined = true;
                await client.distube.voices.join(tartarosChannel)
                //console.log(await guild.members.me.edit({ mute: false}))
                
                await delay(3000)
                //await tartarosChannel.guild.members.me.edit({ mute: false })

                // await client.distube.play(playlist)
                // const queue = interaction.client.distube.getQueue(interaction.guild)
                // await queue.setRepeatMode('Queue')
                // await queue.setVolume(40)
                console.log('Unmuted')
            }
        } 
        
        if (oldUser.channelID === tartarosChannel.id && oldUser.channelID != newUser.channelID) {
            usersInTartaros.delete(oldUser.id)
            //await client.distube.voices.leave(tartarosChannel)
            joined = false
        }
    }
}