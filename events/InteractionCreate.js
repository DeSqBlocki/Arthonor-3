const { Events } = require('discord.js')

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) { commandHandler(interaction) };
        if (interaction.isButton()) { buttonHandler(interaction) }
        if (interaction.isMentionableSelectMenu()) { selectMenuHandler(interaction)}
        if (interaction.isUserSelectMenu()) { selectMenuHandler(interaction) }
    }
}
async function commandHandler(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}
async function buttonHandler(interaction) {
    const button = interaction.client.buttons.get(interaction.customId)
    if (!button) { return console.error(`No button registered matching ${interaction.customId}.`) }
    try {
        await button.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}
async function selectMenuHandler(interaction) {
    const selectMenu = interaction.client.selectMenus.get(interaction.customId)
    if (!selectMenu) { return console.error(`No Select Menu registered matching ${interaction.customId}.`) }
    try {
        await selectMenu.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}