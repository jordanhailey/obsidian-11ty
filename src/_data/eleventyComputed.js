const setPermalink = (data) => {
	let {permalink,page:{inputPath:path,filePathStem}} = data;
	if (permalink) return permalink;
	if (/\/index\.md$/.test(path)) {
		filePathStem = filePathStem.substr(0,filePathStem.length-6)
	}
	let dataOut = `${filePathStem}/index.html`.replace(/ /g, "+");
	let stripVaultName = new RegExp(`^\/${process.env.OBSIDIAN_VAULT_NAME}\/`)
	if (stripVaultName.test(dataOut))	dataOut = dataOut.substr(process.env.OBSIDIAN_VAULT_NAME.length+2)
	return dataOut
}

module.exports = {
	permalink: data => /\/__[^/]+/.test(data.page.inputPath) ? false : setPermalink(data),
	eleventyExcludeFromCollections: data => data.eleventyExcludeFromCollections ? data.eleventyExcludeFromCollections : /\/__[^/]+/.test(data.page.inputPath),
}
