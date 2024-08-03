const fs = require('node:fs')
const path = require('node:path')
module.exports = (client) => {
	// const legacyFoldersPath = path.join(__dirname, '../legacyCommands');
	// const legacyCommandFolders = fs.readdirSync(legacyFoldersPath);
	// let legacyCount = 0
	// let aliasCount = 0
	// for (const folder of legacyCommandFolders) {
	// 	const commandsPath = path.join(legacyFoldersPath, folder);
	// 	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// 	for (const file of commandFiles) {
	// 		legacyCount++
	// 		const filePath = path.join(commandsPath, file);
	// 		const command = require(filePath);
	// 		if ('execute' in command) {
	// 			client.legacyCommands.set(command.name, command);
	// 		}
	// 		if (command.aliases && Array.isArray(command.aliases)) {
	// 			command.aliases.forEach(alias => {
	// 				aliasCount++
	// 				client.aliases.set(alias, command.name)
	// 			})
	// 		}
	// 	}
	// }
	// console.log(`[${aliasCount}] Aliase(s) initialized`)
	// console.log(`[${legacyCount}] Legacy Command(s) initialized`)

}
