const setPermalink = (data) => {
	if (data.permalink) return data.permalink;
	let dataOut = `${data.page.filePathStem}/index.html`.replace(/ /g, "+");
	let stripVaultName = new RegExp(`^\/${process.env.OBSIDIAN_VAULT_NAME}\/`)
	if (stripVaultName.test(dataOut))	dataOut = dataOut.substr(process.env.OBSIDIAN_VAULT_NAME.length+2)
	return dataOut
}

module.exports = {
	permalink: data => /\/templates\//.test(data.page.inputPath) ? false : setPermalink(data),
	eleventyExcludeFromCollections: data => data.eleventyExcludeFromCollections ? data.eleventyExcludeFromCollections : /\/templates\//.test(data.page.inputPath),
}
