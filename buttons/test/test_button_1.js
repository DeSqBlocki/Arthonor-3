module.exports = {
    name: 'test_button_1',
    description: 'a test button',
    execute(interaction){
        interaction.reply({
            content: 'Success'
        })
    }
}