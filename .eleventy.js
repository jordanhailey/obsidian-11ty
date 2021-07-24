module.exports = (eleventyConfig) => {
	return {
		dataTemplateEngine: "njk",
		markdownTemplateEngine: 'njk',
		htmlTemplateEngine: 'njk',
		dir: {
			input: 'src'
		}
	}
}
