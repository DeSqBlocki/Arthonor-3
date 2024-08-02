const fs = require('node:fs')
const path = require('node:path')
module.exports = (client) => {
	const buttonsFoldersPath = path.join(__dirname, '../buttons');
	const buttonsFolders = fs.readdirSync(buttonsFoldersPath);
	let buttonCount = 0
	for (const folder of buttonsFolders) {
		const buttonsPath = path.join(buttonsFoldersPath, folder);
		const buttonsFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
		for (const file of buttonsFiles) {
			buttonCount++
			const filePath = path.join(buttonsPath, file);
			const button = require(filePath);
			if ('execute' in button) {
				client.buttons.set(button.name, button);
			}
		}
	}
	console.log(`[${buttonCount}] Button(s) initialized`)
}
