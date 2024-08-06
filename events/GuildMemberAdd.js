const { Events } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const path = require('node:path');
require('dotenv').configDotenv();

module.exports = {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member, client) {
        const guild = client.guilds.cache.get(process.env.D_GuildID);
        const channel = guild.channels.cache.get(process.env.D_WelcomeID);
        console.log(`${member.user.username} joined the Server`);

        // Create Canvas
        let canvasWidth = 600;
        let canvasHeight = 250;
        const canvas = new createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        // Draw Initial Image
        const background = await loadImage(
            path.join(__dirname, '../assets/background.png')
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
        ctx.fillStyle = '#ffffff'; // White text
        ctx.strokeStyle = '#000000'; // Black outline
        ctx.lineWidth = 3; // Thickness of the outline

        let text = `Willkommen, ${member.user.username}!`;
        let textWidth = ctx.measureText(text).width;
        let textX = canvas.width / 2 - textWidth / 2;
        let textHeight = 35; // Approximate height of the text

        // Draw the text with black outline
        ctx.strokeText(text, textX, 60 + pfp.height);
        ctx.fillText(text, textX, 60 + pfp.height);

        ctx.font = '30px sans-serif';
        text = `auf dem ✨Olymp✨`;
        textWidth = ctx.measureText(text).width;
        textX = canvas.width / 2 - textWidth / 2;
        textHeight = 30; // Approximate height of the text

        // Draw the second line of text with black outline
        ctx.strokeText(text, textX, 100 + pfp.height);
        ctx.fillText(text, textX, 100 + pfp.height);

        const banner = canvas.toBuffer();

        channel.send({
            content: `Bitte guck einmal in die <#850491176540700703> ${member}`,
            files: [{
                attachment: banner,
                name: 'banner.png',
                description: 'a welcome banner'
            }]
        });
    }
};
