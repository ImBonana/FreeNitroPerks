**
 * @name FreeNitroPerks
 * @author Im_Banana#6112
 * @description Unlock all screensharing modes, and use cross-server emotes & gif emotes, Discord wide! (You CANNOT upload 100MB files though. :/)
 * @version 1.0.7
 * @authorId 635250116688871425
 * @website https://github.com/pronoob742/FreeNitroPerks
 * @source https://raw.githubusercontent.com/pronoob742/FreeNitroPerks/main/FreeNitroPerks.plugin.js
 * @updateUrl https://raw.githubusercontent.com/pronoob742/FreeNitroPerks/main/FreeNitroPerks.plugin.js
 */
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();
@else@*/
module.exports = (() => {
    const config = {
        "info": {
            "name": "FreeNitroPerks",
            "authors": [{
                "name": "Im_Banana",
                "discord_id": "635250116688871425",
                "github_username": "pronoob742"
            }],
            "version": "1.0.7",
            "description": "Unlock all screensharing modes (Not Working *temp*) , and use cross-server emotes & gif emotes, Discord wide! (You CANNOT upload 100MB files though. :/)",
            "github": "https://github.com/pronoob742/FreeNitroPerks",
            "github_raw": "https://raw.githubusercontent.com/pronoob742/FreeNitroPerks/main/FreeNitroPerks.plugin.js"
        },
        "changelog": [
            {
                "title": "New Stuff",
                "items": [
                    "Add Sticker bypass. Not Working With Animated Stickers"
                ]
            },
            // {
            //     "title": "Bugs Fixes",
            //     "type": "fixed",
            //     "items": [
            //         "Fix The Emoji Menu"
            //     ]
            // },
            // {
            //     "title": "Improvements",
            //     "type": "improved",
            //     "items": [
            //         "Improve The Code"
            //     ]
            // },
            // {
            //     "title": "On-going",
            //     "type": "progress",
            //     "items": [
            //         "Sharescreen is not working right now but I'm going to fix that later"
            //     ]
            // }
        ],
        "main": "FreeNitroPerks.plugin.js"
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() {
            this._config = config;
        }
        getName() {
            return config.info.name;
        }
        getAuthor() {
            return config.info.authors.map(a => a.name).join(", ");
        }
        getDescription() {
            return config.info.description;
        }
        getVersion() {
            return config.info.version;
        }
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
            const {
                Patcher,
                DiscordModules,
                DiscordAPI,
                Settings,
                Toasts,
                PluginUtilities
            } = Api;

            function setTextInTextBox(text) {
                BdApi.findModuleByProps("ComponentDispatch").ComponentDispatch.dispatch(
                    BdApi.findModuleByProps("ComponentActions").ComponentActions.INSERT_TEXT,
                    {
                        content: text,
                        plainText: text
                    }
                )
            }

            return class NitroPerks extends Plugin {
                defaultSettings = {
                    "emojiSize": "40",
                    "stickerSize": "160",
                    "screenSharing": false,
                    "emojiBypass": true,
                    "sticker": true
                };
                settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
                getSettingsPanel() {
                    return Settings.SettingPanel.build(_ => this.saveAndUpdate(), ...[
                        new Settings.SettingGroup("Screensharing").append(...[
                            new Settings.Switch("High Quality Screensharing", "Enable or disable 1080p/source @ 60fps screensharing. This adapts to your current nitro status.", this.settings.screenSharing, value => this.settings.screenSharing = value)
                        ]),
                        new Settings.SettingGroup("Emojis").append(
                            new Settings.Switch("Nitro Emotes Bypass", "Enable or disable using the Nitro Emote bypass.", this.settings.emojiBypass, value => this.settings.emojiBypass = value),
                            new Settings.Slider("Size", "The size of the emoji in pixels. 40 is recommended.", 16, 64, this.settings.emojiSize, size=>this.settings.emojiSize = size, {markers:[16,20,32,40,64], stickToMarkers:true})
                        ),
                        new Settings.SettingGroup("Stickers").append(
                            new Settings.Switch("Stickers", "Enable or disable using the Nitro Sticker bypass. Not Working With Animated Stickers", this.settings.sticker, value => this.settings.sticker = value),
                            new Settings.Slider("Size", "The size of the sticker in pixels. 160 is recommended.", 130, 190, this.settings.stickerSize, size=>this.settings.stickerSize = size, {markers:[130,140,150,160,170,180,190], stickToMarkers:true})
                        )
                    ])
                }
                
                saveAndUpdate() {
                    PluginUtilities.saveSettings(this.getName(), this.settings)

                    if (this.settings.emojiBypass) {
                        clearInterval(this.fixEmojiMenu)
                        this.fixEmojiMenu = setInterval(() => {
                            let pre = document.querySelector(".premiumPromo-1eKAIB")
                            if(pre != null) document.querySelector(".premiumPromo-1eKAIB").remove()

                            document.querySelectorAll(".emojiItem-277VFM.emojiItemMedium-2stgkv.emojiItemDisabled-3VVnwp").forEach(elem => {
                                elem.classList.remove("emojiItemDisabled-3VVnwp")

                                elem.onclick = function() {                          
                                    setTextInTextBox(`:${elem.dataset.name}:`)
                                }
                            })
                        }, 100)
                        
                        // send emoji
                        Patcher.before(DiscordModules.MessageActions, "sendMessage", (_, [, msg]) => {
                            msg.validNonShortcutEmojis.forEach(emoji => {
                                if (emoji.url.startsWith("/assets/")) return;
                                msg.content = msg.content.replace(`<${emoji.animated ? "a" : ""}${emoji.allNamesString.replace(/~\d/g, "")}${emoji.id}>`, emoji.url + `&size=${this.settings.emojiSize} `)
                            })

                            msg.invalidEmojis.forEach(emoji => {
                                if (emoji.url.startsWith("/assets/")) return;
                                msg.content = msg.content.replace(`<${emoji.animated ? "a" : ""}${emoji.allNamesString.replace(/~\d/g, "")}${emoji.id}>`, emoji.url + `&size=${this.settings.emojiSize} `)
                            })
                        });

                        //for editing message also
                        Patcher.before(DiscordModules.MessageActions, "editMessage", (_,obj) => {
                            let msg = obj[2].content
                            if (msg.search(/\d{18}/g) == -1) return;
                            msg.match(/<a:.+?:\d{18}>|<:.+?:\d{18}>/g).forEach(idfkAnymore=>{
                                obj[2].content = obj[2].content.replace(idfkAnymore, `https://cdn.discordapp.com/emojis/${idfkAnymore.match(/\d{18}/g)[0]}?size=${this.settings.emojiSize}`)
                            })
                        });
                    } else {
                        document.querySelectorAll(".emojiItem-277VFM.emojiItemMedium-2stgkv").forEach(elem => {
                            elem.onclick = function() { }
                            elem.classList.add("emojiItemDisabled-3VVnwp")
                        })

                        clearInterval(this.fixEmojiMenu)
                    }

                    if(this.settings.sticker) {
                        clearInterval(this.fixStickerMenu)
                        this.fixEmojiMenu = setInterval(() => {
                            let pre = document.querySelector("#sticker-picker-grid ~ .upsellWrapper-3KE9GX")
                            if(pre != null) pre.remove()

                            document.querySelectorAll(".stickerNode-3aUBs4.stickerUnsendable-PkQAxI").forEach(elem => {
                                elem.classList.remove("stickerUnsendable-PkQAxI")
                            })

                            document.querySelectorAll(".sticker-H2HhJD.sticker-2Yb_-L div div div img").forEach(elem => {
                                elem.onclick = function() {                          
                                    setTextInTextBox(`$%${elem.dataset.id}%$`)
                                }
                            })
                        }, 100)

                        Patcher.before(DiscordModules.MessageActions, "sendMessage", (_, [, msg]) => {
                            msg.content.match(/(?<=\$\%)(.*?)(?=\%\$)/g).forEach(id => {
                                console.log(`$%${id}%$`)
                                msg.content = msg.content.replace(`$%${id}%$`, `https://media.discordapp.net/stickers/${id}.png?size=${this.settings.stickerSize}`)
                            })
                        });

                        //for editing message also
                        Patcher.before(DiscordModules.MessageActions, "editMessage", (_,obj) => {
                            let msg = obj[2].content
                            if (msg.search(/\d{18}/g) == -1) return;
                            msg.match(/(?<=\$\%)(.*?)(?=\%\$)/g).forEach(id => {
                                console.log(`$%${id}%$`)
                                obj[2].content = msg.replace(`$%${id}%$`, `https://media.discordapp.net/stickers/${id}.png?size=${this.settings.stickerSize}`)
                            })
                            msg.match(/<a:.+?:\d{18}>|<:.+?:\d{18}>/g).forEach(idfkAnymore=>{
                                obj[2].content = obj[2].content.replace(idfkAnymore, `https://cdn.discordapp.com/stickers/${idfkAnymore.match(/\d{18}/g)[0]}?size=${this.settings.emojiSize}`)
                            })
                        });
                    } else {
                        document.querySelectorAll(".stickerNode-3aUBs4").forEach(elem => {
                            elem.classList.add("stickerUnsendable-PkQAxI")
                        })

                        document.querySelectorAll(".sticker-H2HhJD.sticker-2Yb_-L div div div img").forEach(elem => {
                            elem.onclick = function() {                          
                                
                            }
                        })
                    }
                }

                onStart() {
                    this.saveAndUpdate()
                    BDFDB.PatchUtils.forceAllUpdates(this);
                }

                onStop() {
                    clearInterval(this.fixEmojiMenu)
                    clearInterval(this.fixStickerMenu)

                    BDFDB.PatchUtils.forceAllUpdates(this);
                    Patcher.unpatchAll();
                }
            };
        };
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
