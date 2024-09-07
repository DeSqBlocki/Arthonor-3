const { createCanvas, loadImage } = require('canvas');
const path = require('node:path');
const { mClient } = require('..');
require('dotenv').configDotenv();

module.exports = {
    name: "Birthday",
    once: false,
    async execute(member, client) {
        console.log(`${member.user.username} hat Geburtstag!`)


        const db = mClient.db(process.env.DB)
        const channelsColl = db.collection('channels')
        const found = await channelsColl.find(
            {
                $and: [
                    { guildID: member.guild.id },
                    { purpose: 'birthday' }
                ]
            }
        ).toArray()

        if (!found) {
            return console.log('Channel not yet set for birthday!')
        }


        const guild = client.guilds.cache.get(found[0].guildID);
        const channel = guild.channels.cache.get(found[0].channelID);
        
        const roleID = '702877228857557002'
        const role = guild.roles.cache.get(roleID)
        
        try {
            await member.roles.add(role)
        } catch (error) {
            console.error(error)
        }
        // Create Canvas
        let canvasWidth = 600;
        let canvasHeight = 250;
        const canvas = new createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        // Draw Initial Image
        const background = await loadImage(
            path.join(__dirname, '../assets/bdbanner.png')
        );
        let x = 0;
        let y = 0;
        ctx.drawImage(background, x, y);

        // Create Profile Picture
        const pfp = await loadImage(
            member.user.displayAvatarURL({
                extension: 'jpg',
                size: 64,
            })
        );

        // Draw Profile Picture on Top of Background
        x = canvas.width / 2 - pfp.width / 2;
        y = 20;
        ctx.drawImage(pfp, x, y);

        // Set styles for text
        ctx.font = '35px sans-serif';
        ctx.fillStyle = '#FFC0CB'; // Pink text
        ctx.strokeStyle = '#000000'; // Black outline
        ctx.lineWidth = 3; // Thickness of the outline

        let text = `Alles Gute zum Geburtstag! `;
        let textWidth = ctx.measureText(text).width;
        let textX = canvas.width / 2 - textWidth / 2;
        let textHeight = 35; // Approximate height of the text

        // Draw the text with black outline
        ctx.strokeText(text, textX, 60 + pfp.height);
        ctx.fillText(text, textX, 60 + pfp.height);

        ctx.font = '30px sans-serif';
        text = `🥳 ${member.user.globalName ? member.user.globalName : member.user.username} 🎉`;
        textWidth = ctx.measureText(text).width;
        textX = canvas.width / 2 - textWidth / 2;
        textHeight = 30; // Approximate height of the text

        // Draw the second line of text with black outline
        ctx.strokeText(text, textX, 100 + pfp.height);
        ctx.fillText(text, textX, 100 + pfp.height);

        const banner = canvas.toBuffer();

        channel.send({
            content: `@here`,
            files: [{
                attachment: banner,
                name: 'banner.png',
                description: 'a birthday banner'
            }]
        });
    }
};
