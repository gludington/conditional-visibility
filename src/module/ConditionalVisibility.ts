interface StatusCondition {
    code: string,
    name: string
}
export class ConditionalVisibilty {

    static MODULE_NAME:string = "conditional-visibility";

    static INSTANCE: ConditionalVisibilty;

    static EFFECTS: Map<String, String> = new Map<String, String>(
        [['modules/conditional-visibility/icons/unknown.svg', 'invisible'],
        ['modules/conditional-visibility/icons/foggy.svg', 'obscured'],
        ['modules/conditional-visibility/icons/moon.svg', 'indarkness'],
        ['modules/conditional-visibility/icons/newspaper.svg', 'hidden']]
    );
    
    private _sightLayer: any;

    static initialize(sightlayer: any) {
        ConditionalVisibilty.INSTANCE = new ConditionalVisibilty(sightlayer);
    }

    private constructor(sightLayer: any) {
        this._sightLayer = sightLayer;
        const realRestrictVisibility = sightLayer.restrictVisibility;
    
        this._sightLayer.restrictVisibility = () => {
            
            realRestrictVisibility.call(this._sightLayer);

            const restricted = canvas.tokens.placeables.filter(token => token.visible);
            
            if (restricted && restricted.length > 0) {
                let srcTokens = new Array<Token>();
                if (sightLayer.sources && sightLayer.sources.vision) {
                    for (const [key, source] of sightLayer.sources.vision) {
                        if (key.startsWith("Token.")) {
                            const tok = canvas.tokens.placeables.find(tok => tok.id === key.substring("Token.".length))
                            if (tok) {
                                srcTokens.push(tok);
                            }
                        }
                    }
                } else {
                    if (game.user.isGM === false) {
                        srcTokens = game.user.character.getActiveTokens();
                    }
                }
                if (srcTokens.length > 0) {
                    const flags:any = {};
                    flags.seeinvisible = srcTokens.some(sTok => {
                        return sTok.data.flags['conditional-visibility'] && 
                            (sTok.data.flags['conditional-visibility'].seeinvisible === true
                            || sTok.data.flags['conditional-visibility'].blindsight === true
                            || sTok.data.flags['conditional-visibility'].tremorsense === true
                            || sTok.data.flags['conditional-visibility'].truesight === true);
                    });
                    flags.seeobscured = srcTokens.some(sTok => {
                        return sTok.data.flags['conditional-visibility'] && 
                            (sTok.data.flags['conditional-visibility'].blindsight === true
                            || sTok.data.flags['conditional-visibility'].tremorsense === true);
                    });
                    flags.seeindarkness = srcTokens.some(sTok => {
                        return sTok.data.flags['conditional-visibility'] && 
                        (sTok.data.flags['conditional-visibility'].blindsight === true
                        || sTok.data.flags['conditional-visibility'].devilssight === true
                        || sTok.data.flags['conditional-visibility'].tremorsense === true
                        || sTok.data.flags['conditional-visibility'].truesight === true);
                    });
                    //@ts-ignore
                    flags.prc = Math.max(srcTokens.map(sTok => {
                        if (sTok.actor && sTok.actor.data && sTok.actor.data.data.skills.prc.passive) {
                            return sTok.actor.data.data.skills.prc.passive;
                        }
                        return -1;
                    }));
                    for (let t of restricted) {
                        if (srcTokens.indexOf(t) < 0) {
                            t.visible = this.compare(t, flags);
                        }
                    }
                }
            }
        }

        game.socket.on("modifyEmbeddedDocument", async (message) => {
            const result = message.result.find(result => {
                return result.effects || (result.flags && result.flags[ConditionalVisibilty.MODULE_NAME]);
            });

            if (this.shouldRedraw(result)) {
                await this.draw();
            }
        })
    }

    public shouldRedraw(toTest: any) {
        return toTest && ((toTest.effects) // && toTest.effects.some(effect => effect.indexOf(ConditionalVisibilty.MODULE_NAME) > -1)) //TODO optimize, perhaps with flag dummy value?
        || (toTest.flags && toTest.flags[ConditionalVisibilty.MODULE_NAME]));
    }

    public async onRenderTokenConfig(tokenConfig: any, jQuery:JQuery, data: any) {
        const visionTab = $('div.tab[data-tab="vision"]');
        const extraSenses = await renderTemplate("modules/conditional-visibility/templates/extra_senses.html", tokenConfig.object.data.flags[ConditionalVisibilty.MODULE_NAME] || {});
        visionTab.append(extraSenses);
    }

    public async onRenderTokenHUD(app, html, data) {
        const effects = ConditionalVisibilty.EFFECTS.keys();
        const effectIcons = html.find("img.effect-control")
            .each((idx, icon) => {
                const src = icon.attributes.src.value;
                if (ConditionalVisibilty.EFFECTS.has(src)) {
                    let title;
                    if (ConditionalVisibilty.EFFECTS.get(src) === 'hidden') {
                        //@ts-ignore
                        title = game.i18n.format('CONVIS.' + ConditionalVisibilty.EFFECTS.get(src), "{}");
                        if (data.flags[ConditionalVisibilty.MODULE_NAME]._ste && !isNaN(parseInt(data.flags[ConditionalVisibilty.MODULE_NAME]._ste))) {
                            //@ts-ignore
                            title += ' ' + game.i18n.format('CONVIS.currentstealth') + ': ' + data.flags[ConditionalVisibilty.MODULE_NAME]._ste;
                        }
                    } else {
                        //@ts-ignore
                        title = game.i18n.format('CONVIS.' + ConditionalVisibilty.EFFECTS.get(src), "{}");
                    }
                    icon.setAttribute("title", title);
                }
            });
    }

    public async onPreUpdateToken(token:any, update:any) {
        if (update.effects) {
            if (update.effects.some(eff => eff.endsWith('newspaper.svg'))) {
                
                let currentStealth;
                try {
                    currentStealth = parseInt(token.flags[ConditionalVisibilty.MODULE_NAME]._ste);
                } catch (err) {
                    
                }

                if (currentStealth === undefined || isNaN(parseInt(currentStealth))) {
                    const actor = game.actors.entities.find(a => a.id);
                    if (actor) {
                        const roll = new Roll("1d20 " + actor.data.data.skills.ste.total).roll();
                        const result = roll._result;
                        if (!update.flags) {
                            update.flags = {};
                        }
                        if (!update.flags[ConditionalVisibilty.MODULE_NAME]) {
                            update.flags[ConditionalVisibilty.MODULE_NAME] = {};
                        }
                        
                        const pr:number = parseInt(prompt(game.i18n.format("CONVIS.stealthroll", {}), result));
                        if (isNaN(pr)) {
                            update.flags[ConditionalVisibilty.MODULE_NAME]._ste = roll._result;    
                        } else {
                            update.flags[ConditionalVisibilty.MODULE_NAME]._ste = pr;    
                        }
                    }
                }
            } else {
                if (!update.flags) {
                    update.flags = {};
                }
                if (!update.flags[ConditionalVisibilty.MODULE_NAME]) {
                    update.flags[ConditionalVisibilty.MODULE_NAME] = {};
                }
                update.flags[ConditionalVisibilty.MODULE_NAME]._ste = "";
            }
            await this.draw();
        } else if (update.flags && update.flags[ConditionalVisibilty.MODULE_NAME]) {
            await this.draw();
        }
    }

    private async draw() {
        await this._sightLayer.initialize();
        await this._sightLayer.update();
    }

    private compare(tokenToSee:any, flags:any): boolean {
        const effects = tokenToSee.data.effects;
        if (effects.length > 0) {
            const invisible = effects.some(eff => eff.endsWith('unknown.svg'));
            if (invisible === true) {
                if (flags.seeinvisible !== true) {
                    return false;
                }
            }
            
            const obscured = effects.some(eff => eff.endsWith('foggy.svg'));
            if (obscured === true) {
                if (flags.seeobscured !== true) {
                    return false;
                }
            }
            const indarkness = effects.some(eff => eff.endsWith('moon.svg'));
            if (indarkness === true) {
                if (flags.seeindarkness !== true) {
                    return false;
                }
            }
            const hidden = effects.some(eff => eff.endsWith('newspaper.svg'));
            if (hidden === true) {
                if (tokenToSee.data.flags[ConditionalVisibilty.MODULE_NAME] && tokenToSee.data.flags[ConditionalVisibilty.MODULE_NAME]._ste) {
                    const stealth = tokenToSee.data.flags[ConditionalVisibilty.MODULE_NAME]._ste;
                    if (flags.prc < stealth) {
                        return false;
                    }
                }
            }
            return true;
        } else {
            return true;
        }
    
    }
}
