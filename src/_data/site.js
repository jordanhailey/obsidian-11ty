const {OBSIDIAN_VAULT_NAME:VAULT_NAME,GITHUB_REPO,GIT_BRANCH,GITHUB_REPO_IS_PUBLIC} = process.env;

module.exports = {
	title: VAULT_NAME,
	description: "A place for my thoughts",
	github_repo: {
		base: GITHUB_REPO,
		branch: GIT_BRANCH,
		isPublic:GITHUB_REPO_IS_PUBLIC
	}
}
