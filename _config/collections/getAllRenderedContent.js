const VAULT_NAME = process.env.OBSIDIAN_VAULT_NAME;
const vaultNameRegExp = new RegExp(`^\/{0,1}${VAULT_NAME}\/`);

const normalizeURL = (url) => {
	if (url.substr(0,6) == "./src/") url = url.substr(6);
	if (vaultNameRegExp.test(url)) url = url.substr(VAULT_NAME.length+1)
	if (url.length < 2) return url;
	url = url[url.length-1] == "/" ? url.substr(0,url.length-1) : url;
	return url;
}


module.exports = (collection) => {
	let all = collection.items.map(({url,filePathStem})=>({path:normalizeURL(filePathStem),url}))
		.sort((a,b)=>a.url.localeCompare(b.url));
	const p = new Map();
	all.forEach(({path,url})=>{
		if (/\.html/.test(url)) url = url.substr(0,url.length-'.html'.length)
		p.set(url,path)
	})
	//console.log({p})
	return p;
}
