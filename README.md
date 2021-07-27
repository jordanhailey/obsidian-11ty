#	Self Hosted Obsidian

A starter package to host Obsidian notes using 11ty

## Setup

This is set up to be a fairly lightweight plug-and-play option to host your Obsidian notes. There are, however, some essential configuration steps required for this to build and run.

> ***NOTE***: 
> - You will either be creating, or moving an existing vault, if you are moving your existing vault, make sure to create a complete backup of your vault prior to moving it for safe measure.
> - Replace any occurance of `YOUR_VAULT_PARENT_DIRECTORY` with your actual vault name. 
>   - If your vault name has spaces, you must prefix each space with 
>     a forward slash ("\") character i.e. `YOUR\ VAULT`
> 
> - `_$_` = running this command is not necessary
> - `>`  = command output
> 

1. Clone (or download and unzip) this repository wherever you wish to host your vault.
    ```sh
    $_  cd /DESIRED/PATH/TO/YOUR_VAULT_PARENT_DIRECTORY
    $_  git clone ${TODO_ADD_GITHUB_REPO_LINK}
    ```

2. Change into the eleventy app directory and install the dependencies.
    ```sh
    $_ cd obsidian-11ty
    $_ pnpm i 
    # OPTIONALLY: run `npm i` if you do not have pnpm installed
    ```


3. Using a text editor, copy the `.env-example` file and rename to `.env`, change the values to reflect your vault's configuration
    > NOTE:
    - You may have your vault at the same level as the eleventy app, just remember to use a relative path to `YOUR_VAULT` 
    ```sh
    # .env

    OBSIDIAN_VAULT_NAME=SAMPLE_VAULT
    OBSIDIAN_CONFIG=.obsidian
    ```
