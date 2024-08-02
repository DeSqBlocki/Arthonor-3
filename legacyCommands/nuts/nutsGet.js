const { mClient } = require('../../index')
require('dotenv').config()
module.exports = {
	name: 'nuts',
	description: 'get nuts',
	aliases: ['n', 'nget', 'nutsget'],
	async execute(message, args) {
		const db = mClient.db(process.env.M_DB)
		const nutsColl = db.collection('nuts')
		const cdColl = db.collection('cooldown')

		const cdData = await cdColl.findOne({ userID: message.author.id })

		if (!cdData || cdData.cooldown < Date.now() / 1000) {
			let cd = Math.floor((Date.now() + 3600000) / 1000)
			await cdColl.findOneAndUpdate({
				userID: message.author.id
			}, {
				$set: { cooldown: cd }
			}, {
				upsert: true
			})

			const amount = Math.floor(Math.random() * 10)

			await nutsColl.findOneAndUpdate({
				userID: message.author.id
			}, {
				$inc: { nuts: amount }
			}, {
				upsert: true
			})

			let content = `Du hast ${amount} Nüsse bekommen! :chestnut:`
			if (!amount) {
				content = `Du hast leider keine Nüsse bekommen :(`
			}
			return await message.reply({
				content: content
			})
		} else {
			return await message.reply({
				content: `Du kannst erst <t:${Math.floor(cdData?.cooldown / 1000)}:R> wieder nussen :(`,
			})
		}
	},
};