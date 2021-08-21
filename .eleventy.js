const fs = require('fs');
const jsdom = require('jsdom');
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
		//url = url[url.length-1] == "/" ? url.substr(0,url.length-1) : url;
		return url;
	}

	const COLLECTION_MOD = require("./_config/index").collections;
	let allRendered;

	eleventyConfig.addCollection("linkablePages",(c)=>{
		let output = COLLECTION_MOD.getAllRenderedContent(c);
		allRendered = output;
		return output;
	})

	eleventyConfig.addFilter('markdownifyWikiLinks',(content,pagePath="") => {
		const {JSDOM} = jsdom;
		const {window} = new JSDOM(`<!DOCTYPE html>\n<html>\n<body>\n${content}\n</body>\n</html>`);
		const elements = window.document.querySelector("div")?.children;
		const obsidianWikiLinkRegex = /(!)*\[\[([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/g;
		const obsidianAttachmentType = new RegExp(`\.(${obsidianNonDefaultFiletypes.map(ft=>ft).join("|")}){1}`,"i");
		const matches = [...content.matchAll(obsidianWikiLinkRegex)];
		const links = [];
		matches?.forEach(wikilink => {
			const [match,embed,path,altText] = wikilink;
			let index = wikilink.index;
			let link = {
				href:path.replace(/ /g,'%20'),
				text:altText ? altText.substr(1) : path,
				matchIndex:index,
				matchLength:match.length,
				class: embed ? 'embedded-wikilink' : 'inline-wikilink',
			}
			function isURLtoAsset(url){return /\/{0,1}__assets\//.test(url)}
			let P = "/"+link.href;
			let isRendered = false; 
			if (isURLtoAsset(P)) isRendered = true;
			else {
				P = P.replace(/%20/, "+")
				if (P.substr(-6) == ("/index")) P = P.substr(0,P.length-5);
				if (allRendered.has(P) || allRendered.has(P+"index")) isRendered = true;
				else {
					for ([k,v] of allRendered.entries()) {
						P = P[0]=="/" ? P.substr(1) : P;
						P = P.substr(-6) == "/index" ? P.substr(0,P.length-5) : P
						if (k.substr(-1 * P.length) == P || k.substr(-1 * P.length)+"index" == P) {
							isRendered = true
							link.href = v.substr(1);
							break;
						}
					}
				}
			}
			link.isRendered = isRendered
			link.type = link.href.match(obsidianAttachmentType)?.[1] || null;
			links.push(link);
		});
		let offset=0;
		if (links.length == 0) return content;
		links?.forEach((link)=>{
			let {isRendered,href,text,matchIndex:idx,matchLength:ln,class:cl,type:t} = link;
			if (/\/index$/.test(text)) {
				href = href.substr(0,href.length-5);
			}
			href = (t || href.substr(-1) == "/") ? href : href+".html"
			if (text == "index" && href !== "index/") {
				href = ""
			}
			let replacement = `<a href="${(t && !/^__assets\//.test(href)) ? '/__assets':''}/${t ? href : href.replace(/%20/g,'+')}" class="${cl}${t? ' '+t:''}">${text}</a>`;
			if (!isRendered) {
				replacement = `<span class="private_content">[\[${text}]\]</span>`
			}
			let {content:c,offset:o} = replaceContent({content,toReplaceLength:ln,indexOf:idx,replacement,offset})
			content = c;
			offset = o;
		});
		return content;
	})

	function replaceContent ({content,toReplaceLength,indexOf,replacement,offset}) {
		if (!content==undefined || toReplaceLength==undefined || indexOf==undefined || replacement==undefined || offset==undefined) return content;
		content = content.substr(0,indexOf+offset)+replacement+content.substr(indexOf+toReplaceLength+offset);
		offset = offset - (toReplaceLength - replacement.length)
		//offset = toReplaceLength > replacement.length ? offset + toReplaceLength - replacement.length : offset + replacement.length - toReplaceLength;
		return {content,offset}
	}

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


	eleventyConfig.setFrontMatterParsingOptions({
		excerpt: true,
		excerpt_seperator: '<!-- endEleventyExcerpt -->'
	})


	return {
		dataTemplateEngine: "njk",
		markdownTemplateEngine: 'njk',
		htmlTemplateEngine: 'njk',
		dir: {
			input: 'src'
		}
	}
}
