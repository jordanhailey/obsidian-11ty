const VAULT_NAME = process.env.OBSIDIAN_VAULT_NAME;
const vaultNameRegExp = new RegExp(`^\/{0,1}${VAULT_NAME}\/`);
const normalizeURL = (url) => {
	if (/\.md$/.test(url)) {
		url = url.substr(0,url.length-3);
	}
	if (url.substr(0,6) == "./src/") url = url.substr(6);
	if (vaultNameRegExp.test(url)) url = url.substr(VAULT_NAME.length+1)
	if (url.length < 2) return url;
	url = url[url.length-1] == "/" ? url.substr(0,url.length-1) : url;
	return url;
}

const setPermalink = (data) => {
	let {permalink,page:{inputPath:path,filePathStem}} = data;
	if (permalink) return permalink;
	path = normalizeURL(path);
	let dataOut = `${path}.html`.replace(/ /g, "+");
	return dataOut
}

module.exports = {
	permalink: data => /\/__[^/]+/.test(data.page.inputPath) ? false : setPermalink(data),
	eleventyExcludeFromCollections: data => data.eleventyExcludeFromCollections ? data.eleventyExcludeFromCollections : /\/__[^/]+/.test(data.page.inputPath),
}
