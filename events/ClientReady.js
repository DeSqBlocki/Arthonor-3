const { Events, ActivityType } = require('discord.js');
const { mClient } = require('..');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`)
        client.user.setPresence({
            activities: [{
                name: 'Red Dead Depression',
                type: ActivityType.Streaming,
                url: 'https://twitch.tv/desq_blocki'
            }],
            status: 'online'
        })

        // if today is birthday
        function isToday(day, month) {
            const currentYear = new Date().getFullYear();
            const inputDate = new Date(currentYear, month - 1, day);
            const today = new Date();
            return (
                inputDate.getDate() === today.getDate() &&
                inputDate.getMonth() === today.getMonth() &&
                inputDate.getFullYear() === today.getFullYear()
            );
        }
        async function isBirthday() {
            const db = mClient.db(process.env.M_DB)
            const bdayColl = db.collection('birthdays')
            const allBirthdays = await bdayColl.find().toArray()
            for (let index = 0; index < allBirthdays.length; index++) {
                if (isToday(allBirthdays[index].day, allBirthdays[index].month)) {
                    let guild = client.guilds.cache.get(process.env.D_GuildID)
                    let member = guild.members.cache.get(allBirthdays[index].userID)
                    client.emit('Birthday', member)
                } else {
                    // remove any residual birthday roles
                    try {
                        let guild = client.guilds.cache.get(process.env.D_GuildID)
                        let member = guild.members.cache.get(allBirthdays[index].userID)
                        await member.roles.remove('702877228857557002')
                    } catch (error) {
                        console.error('Could not remove role', error)
                    }
                }
            }
        }
        isBirthday()
    }
}
