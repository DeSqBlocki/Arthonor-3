const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js')
const { MongoClient } = require('mongodb')
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp')
require('dotenv').config()
const mClient = new MongoClient(process.env.M_URI)
exports.mClient = mClient;
const fs = require('node:fs')

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds, 
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

// Initialize DisTube with YtDlpPlugin and request options
const distube = new DisTube(client, {
	plugins: [
	  new YtDlpPlugin(),
	],
  });

client.distube = distube

fs.readdirSync('./handlers').forEach((handler) => {
	require(`./handlers/${handler}`)(client)
  });


distube.on('error', (channel, error) => {client.emit('DistubeError', (channel, error))})  
client.login(process.env.D_Token)