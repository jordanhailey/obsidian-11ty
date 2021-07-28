const fs = require('fs');
require('dotenv').config();
const {OBSIDIAN_VAULT_NAME,OBSIDIAN_CONFIG} = process.env
let attachmentsDir = fs.readFileSync(process.cwd()+"/src/"+OBSIDIAN_VAULT_NAME+"/"+OBSIDIAN_CONFIG+"/app.json",'utf-8')
if (attachmentsDir) attachmentsDir = JSON.parse(attachmentsDir)?.attachmentFolderPath || "__assets";

module.exports = (eleventyConfig) => {
	eleventyConfig.setWatchThrottleWaitTime(1000); // in milliseconds
	const obsidianNonDefaultFiletypes = ["md","css","png","jpg","jpeg","gif","bmp","svg","mp3","webm","wav","m4a","ogg","3gp","flac","mp4","webm","ogv","pdf"]

	const stripLeadingAndTrailingSlashes = (url) => {
		if (url.length < 2) return url
		url = url[0]=="/" ? stripLeadingAndTrailingSlashes(url.substr(1)) : url;
		url = url[url.length-1] == "/" ? url.substr(0,url.length-1) : url;
		return url;
	}
	const alphaNumericSort = (arr = []) => {
		const sorter = ([a], [b]) => {
			 const isNumber = (v) => (+v).toString() === v;
			 const aPart = a.match(/\d+|\D+/g);
			 const bPart = b.match(/\d+|\D+/g);
			 let i = 0; let len = Math.min(aPart.length, bPart.length);
			 while (i < len && aPart[i] === bPart[i]) { i++; };
					if (i === len) {
						 return aPart.length - bPart.length;
			 };
			 if (isNumber(aPart[i]) && isNumber(bPart[i])) {
					return aPart[i] - bPart[i];
			 };
			 return aPart[i].localeCompare(bPart[i]); 
		};
		return arr.sort(sorter);
	};

	eleventyConfig.addCollection("allRendered", function(collection) {
    // get unsorted items
		const allRenderedItems = collection.getAll();
		const resolvedPermalinks = new Map();
		allRenderedItems.forEach(item => {
			let {url,fileSlug,filePathStem} = item;
			url = stripLeadingAndTrailingSlashes(url);
			filePathStem = stripLeadingAndTrailingSlashes(filePathStem);
			let stripVaultName = new RegExp(`^${process.env.OBSIDIAN_VAULT_NAME}\/`)
			if (stripVaultName.test(url))	url = url.substr(process.env.OBSIDIAN_VAULT_NAME.length+1)
			if (stripVaultName.test(filePathStem))	filePathStem = filePathStem.substr(process.env.OBSIDIAN_VAULT_NAME.length+1)
			let matches = url.split("/");
			matches = matches.filter(m => m !== "")
			if (matches.length > 1) {
				//console.log(url,matches)
				while (matches.length > 0) {
					let m = matches.join('/');
					let f = resolvedPermalinks.get(m);
					if (f) {
						f.push(filePathStem);
						f = f.sort((a,b)=>a.length<b.length);
						resolvedPermalinks.set(m,f);
					}
					else resolvedPermalinks.set(m,[filePathStem]);
					matches = matches.slice(1)
				}
			} else {
					resolvedPermalinks.set(url,[url])
			}
		})
		const sortedOutput = new Map(alphaNumericSort([...resolvedPermalinks.entries()]));
    return sortedOutput;
  });

	eleventyConfig.addFilter('markdownifyWikiLinks',(content) => {
		const obsidianWikiLinkRegex = /(!)*\[\[([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/g;
		const matches = [...content.matchAll(obsidianWikiLinkRegex)]
		const links = [];
		matches?.forEach(wikilink => {
			const [match,embed,path,altText] = wikilink;
			let index = wikilink.index
			//console.log({match,embed,path,altText,index})
			let link = {
				href:path.replace(/ /g,'%20'),
				text:altText ? altText.substr(1) : path,
				matchIndex:index,
				matchLength:match.length,
				class: embed ? 'embedded' : 'wikilink',
			}
			let rg = `(${obsidianNonDefaultFiletypes.map(ft=>ft).join("|")})`
			rg = new RegExp(`\.${rg}{1}`,"i")
			link.type = link.href.match(rg)?.[1];
			links.push(link)
		})
		let offset=0;
		links?.forEach((link)=>{
			let {href,text,matchIndex:idx,matchLength:ln,class:cl,type:t} = link;
			if (/\/index$/.test(text)) {
				text = text.substr(0,text.length-6);
				href = href.substr(0,href.length-5);
			}
			if (text == "index" && href !== "index/") {
				href = ""
			}
			let replacement = `<a href="${(t && !/^__assets\//.test(href)) ? '/__assets':''}/${t ? href : href.replace(/%20/g,'+')}" class="${cl}${t? ' '+t:''}">${text}</a>`;
			if (href.includes("__") && !/^__assets/.test(href)) {
				replacement = `<span class="private_content">[\[${text}]\]</span>`
			}
			content = content.substr(0,idx+offset)+replacement+content.substr(idx+ln+offset)
			offset = ln > replacement.length ? offset + ln - replacement.length : offset + replacement.length - ln;
		})
		return content
	})

	/** 
	 * Copy over any content from Obsidian that is not currently supported by 11ty
	 * https://help.obsidian.md/Advanced+topics/Accepted+file+formats
	*/
	//eleventyConfig.setTemplateFormats(obsidianNonDefaultFiletypes);
	if (attachmentsDir){
		eleventyConfig.addPassthroughCopy({[`src/${OBSIDIAN_VAULT_NAME}/${attachmentsDir}`]:'/__assets'});
	}

	eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, bs) {

        bs.addMiddleware("*", (req, res) => {
          const content_404 = fs.readFileSync('_site/404/index.html');
          // Add 404 http status code in request header.
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      }
    }
  });


	return {
		dataTemplateEngine: "njk",
		markdownTemplateEngine: 'njk',
		htmlTemplateEngine: 'njk',
		dir: {
			input: 'src'
		}
	}
}
