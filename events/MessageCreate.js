const { Events } = require('discord.js')
require('dotenv').config()
const { client } = require('../index')
const prefix = process.env.D_Prefix

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();
        let command = client.legacyCommands.get(cmd)
        if(!command) command = client.legacyCommands.get(client.aliases.get(cmd))
        if(!command) return
        try {  
            client.legacyCommands.get(command.name).execute(message, args)
        } catch (error) {
            console.error(error)
        }

    }
}