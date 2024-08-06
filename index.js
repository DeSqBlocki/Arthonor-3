const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js')
const { MongoClient } = require('mongodb')
require('dotenv').config()
const mClient = new MongoClient(process.env.M_URI)
exports.mClient = mClient;
const fs = require('node:fs')

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildPresences, 
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildVoiceStates, 
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent
	], 
	partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction] 
});
exports.client = client

client.commands = new Collection() // slash commands collection
client.legacyCommands = new Collection() // legacy commands collection
client.aliases = new Collection() // list of command aliases
client.buttons = new Collection() // list of buttons
client.selectMenus = new Collection() // list of selectMenus

fs.readdirSync('./handlers').forEach((handler) => {
	require(`./handlers/${handler}`)(client)
  });

  client.login(process.env.D_Token)