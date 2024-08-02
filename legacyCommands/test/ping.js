module.exports = {
    name: 'ping',
    description: 'returns pong!',
    aliases: [''],
    async execute(message, args) {
        message.reply('pong!')
    }
}