interface StatusCondition {
    code: string,
    name: string
}
export class ConditionalVisibilty {

    static MODULE_NAME:string = "conditional-visibility";

    static INSTANCE: ConditionalVisibilty;

    sightLayer: any;

    static initialize(sightlayer: any) {
        ConditionalVisibilty.INSTANCE = new ConditionalVisibilty(sightlayer);
    }

    private constructor(sightLayer: any) {
        this.sightLayer = sightLayer;
        const realRestrictVisibility = sightLayer.restrictVisibility;
    
        this.sightLayer.restrictVisibility = () => {
            
            realRestrictVisibility.call(this.sightLayer);

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
                    for (let t of restricted) {
                        if (srcTokens.indexOf(t) < 0) {
                            t.visible = this.compare(t.data.effects, flags);
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

    public async checkRedraw(update:any) {
        if (this.shouldRedraw(update)) {
            await this.draw();
        }
    }

    private async draw() {
        await this.sightLayer.initialize();
        await this.sightLayer.update();
    }

    private compare(effects:any, flags:any): boolean {
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
            return true;
        } else {
            return true;
        }
    
    }
}
