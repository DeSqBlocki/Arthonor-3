module.exports = {
    name: 'DistubeError',
    once: true,
    async execute(channel, error) {
        console.log({
            channel: channel,
            error: error
        })
    }
}