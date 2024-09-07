const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { mClient } = require('../..')
const { configDotenv } = require('dotenv')
configDotenv()

function isValidDate(day, month) {
    // Define the number of days in each month
    const daysInMonth = {
        1: 31, // January
        2: 28, // February (ignore leap years)
        3: 31, // March
        4: 30, // April
        5: 31, // May
        6: 30, // June
        7: 31, // July
        8: 31, // August
        9: 30, // September
        10: 31, // October
        11: 30, // November
        12: 31  // December
    };

    // Check if month is valid
    if (month < 1 || month > 12) {
        return false;
    }

    // Check if day is valid for the given month
    if (day < 1 || day > daysInMonth[month]) {
        return false;
    }

    return true;
}

async function birthdayAdd(interaction) {
    let target = await interaction.options.getUser('user')
    let day = await interaction.options.getNumber('day')
    let month = await interaction.options.getNumber('month')


    if (!isValidDate(day, month)) {
        return interaction.reply({ content: "Invalid Date", ephemeral: true })
    }

    const db = mClient.db(process.env.M_DB)
    const bdayColl = db.collection('birthdays')

    const found = await bdayColl.findOne({ userID: target.id })
    if (found) {
        return interaction.reply({ content: "Already in Database", ephemeral: true })
    }

    const data = {
        guildID: interaction.guild.id,
        userID: target.id,
        day: day,
        month: month
    }

    const res = await bdayColl.insertOne(data)
    if (res.acknowledged) {
        return interaction.reply({ content: "Birthday added successfully!" })
    } else {
        return interaction.reply({ content: "There was an issue!" })
    }
}
async function birthdayDelete(interaction) {
    var target = await interaction.options.getUser('user')
    const guild = await interaction.client.guilds.cache.get(interaction.guild.id)
    if (!target) {
        target = await guild.members.cache.get(await interaction.options.getString('id'))
    }

    if (!target) {
        return interaction.reply({ content: "Invalid or No User specified!" })
    }

    const db = mClient.db(process.env.M_DB)
    const bdayColl = db.collection('birthdays')

    const found = await bdayColl.findOne({ userID: target.id })
    if (!found) {
        return interaction.reply({ content: "Not yet in Database", ephemeral: true })
    }

    const res = await bdayColl.deleteOne({ userID: target.id })
    if (res.acknowledged) {
        return interaction.reply({ content: "Birthday removed successfully!" })
    } else {
        return interaction.reply({ content: "There was an issue!" })
    }
}
async function birthdayEdit(interaction) {
    let target = await interaction.options.getUser('user')
    let day = await interaction.options.getNumber('day')
    let month = await interaction.options.getNumber('month')


    if (!isValidDate(day, month)) {
        return interaction.reply({ content: "Invalid Date", ephemeral: true })
    }

    const db = mClient.db(process.env.M_DB)
    const bdayColl = db.collection('birthdays')

    const found = await bdayColl.findOne({ userID: target.id })
    if (!found) {
        return interaction.reply({ content: "Not yet in Database", ephemeral: true })
    }

    const data = {
        guildID: interaction.guild.id,
        userID: target.id,
        day: day,
        month: month
    }

    const res = await bdayColl.findOneAndUpdate({ userID: target.id }, { $set: data }, { upsert: true })
    return interaction.reply({ content: "Birthday edited successfully!" })
}
async function isDateInPast(day, month) {
    const currentYear = new Date().getFullYear();
    const inputDate = new Date(currentYear, month - 1, day);
    const now = new Date();
    return inputDate < now;
}
async function makeTimestamp(day, month, year) {
    const date = new Date(year, month - 1, day);
    const unixTimestamp = Math.floor(date.getTime() / 1000);
    return unixTimestamp
}
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
async function birthdayGet(interaction) {
    let target = await interaction.options.getUser('user')
    const db = mClient.db(process.env.M_DB)
    const bdayColl = db.collection('birthdays')

    const found = await bdayColl.findOne({ userID: target.id })
    if (!found) {
        return interaction.reply({ content: "Not in Database!", ephemeral: true })
    }
    let unix
    if(isDateInPast(found.day,found.month)){
        let nextYear = new Date().getFullYear() + 1
        unix = await makeTimestamp(found.day,found.month, nextYear)
    } else {
        let thisYear = new Date().getFullYear()
        unix = await makeTimestamp(found.day,found.month, thisYear)
    }
    let description = `is on the <t:${unix}:d>\r\n<t:${unix}:R>`
    if(isToday(found.day, found.month)){
        description = `IS TODAY!🥳🎉`
    }
    const embed = new EmbedBuilder()
        .setThumbnail(target.displayAvatarURL())
        .setTitle(`${target.globalName ? target.globalName: target.username}'s Birthday!`)
        .setDescription(description)
    await interaction.reply({ embeds: [embed] })
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday')
        .setDescription('manage birthdays')
        .addSubcommand(s =>
            s
                .setName('add')
                .setDescription('adds a birthday')
                .addUserOption((option) =>
                    option
                        .setName('user')
                        .setDescription('user')
                        .setRequired(true))
                .addNumberOption((option) =>
                    option
                        .setName('day')
                        .setDescription('day')
                        .setMinValue(1)
                        .setMaxValue(31)
                        .setRequired(true))
                .addNumberOption((option) =>
                    option
                        .setName('month')
                        .setDescription('month')
                        .setMinValue(1)
                        .setMaxValue(12)
                        .setRequired(true))
        )
        .addSubcommand(s =>
            s
                .setName('delete')
                .setDescription('deletes a birthday')
                .addUserOption((option) =>
                    option.setName('user').setDescription('user'))
                .addStringOption((option) =>
                    option.setName('id').setDescription('ID')))
        .addSubcommand(s =>
            s
                .setName('edit')
                .setDescription('edits a birthday')
                .addUserOption((option) =>
                    option.setName('user').setDescription('user').setRequired(true))
                .addNumberOption((option) =>
                    option.setName('day').setDescription('day').setRequired(true))
                .addNumberOption((option) =>
                    option.setName('month').setDescription('month').setRequired(true)))
        .addSubcommand(s =>
            s
                .setName('get')
                .setDescription('gets a birthday')
                .addUserOption((option) =>
                    option.setName('user').setDescription('user').setRequired(true))),
    async execute(interaction) {
        switch (interaction.options._subcommand) {
            case 'add':
                if (!interaction.member.permissions.has("ADMINISTRATOR")) {
                    return await interaction.reply({
                        content: "Unprivileged Access!",
                        ephemeral: true
                    })
                }
                birthdayAdd(interaction)
                break;
            case 'delete':
                if (!interaction.member.permissions.has("ADMINISTRATOR")) {
                    return await interaction.reply({
                        content: "Unprivileged Access!",
                        ephemeral: true
                    })
                }
                birthdayDelete(interaction)
                break;
            case 'edit':
                if (!interaction.member.permissions.has("ADMINISTRATOR")) {
                    return await interaction.reply({
                        content: "Unprivileged Access!",
                        ephemeral: true
                    })
                }
                birthdayEdit(interaction)
                break;
            case 'get':
                birthdayGet(interaction)
                break;
            default:
                break;
        }
    }
}