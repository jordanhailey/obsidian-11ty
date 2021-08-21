---
11ty: 
  pageTitle: My vault
  pageDescription: A sample obsidian vault, built with eleventy
---
# A Sample Vault

Welcome to my sample vault!

![[__assets/my desktop.png|A picture of my desktop]]

[[index]]

## Index pages
At any directory level that you wish to have an index page (which ideally should be every directory), add a file named `index.md`.
```
[[blog/index]] => /blog/
```


[[blog/series1/post 1]]
[[blog/series1/index]]


[[blg/series1/index]]
[[blg/series1]]


[[blog/series2/index]]
[[blog/series2/post 1]]

[[series1/index]]
[[series1]]

## Hidden content
Any files or folders begining with a double underscore `__` should not be built (unless specified in your page frontmatter by providing a permalink) thus these two list items should not navigate anywhere.
- [[__templates/frontmatter]]
- [hidden frontmatter](__templates/frontmatter)
