const fs = require('node:fs')
const path = require('node:path')
module.exports = (client) => {
	const selectMenusFoldersPath = path.join(__dirname, '../selectMenus');
	const selectMenusFolders = fs.readdirSync(selectMenusFoldersPath);
	let selectMenuCount = 0
	for (const folder of selectMenusFolders) {
		const Path = path.join(selectMenusFoldersPath, folder);
		const Files = fs.readdirSync(Path).filter(file => file.endsWith('.js'));
		for (const file of Files) {
			selectMenuCount++
			const filePath = path.join(Path, file);
			const button = require(filePath);
			if ('execute' in button) {
				client.selectMenus.set(button.name, button);
			}
		}
	}
	console.log(`[${selectMenuCount}] Select Menu(s) initialized`)
}
