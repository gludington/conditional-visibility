import { ConditionalVisibilitySystem5e } from "./systems/ConditionalVisibilitySystem5e";
import { ConditionalVisibilitySystemPf2e } from "./systems/ConditionalVisibilitySystemPf2e";
import { ConditionalVisibilitySystem } from "./systems/ConditionalVisibilitySystem";
import { DefaultConditionalVisibilitySystem } from "./systems/DefaultConditionalVisibilitySystem";
import * as Constants from './Constants';
import { ConditionalVisibilityFacade } from "./ConditionalVisibilityFacade";

export class ConditionalVisibility {

    static INSTANCE: ConditionalVisibility;

    private _sightLayer: any;
    private _tokenHud: any;
    private _conditionalVisibilitySystem: ConditionalVisibilitySystem
    private _isV7:boolean;

    private _getSrcTokens: () => Array<Token>;
    private _draw: () => void;

    /**
     * Called from init hook to establish the extra status effects in the main list before full game initialization.
     */
    static onInit() {
        const system = ConditionalVisibility.newSystem();
        system.initializeStatusEffects();
    }

    /**
     * Create a new ConditionalVisibilitySystem appropriate to the game system
     * @returns ConditionalVisibilitySystem
     */
    private static newSystem():ConditionalVisibilitySystem {
        let system;
        switch (game.system.id) {
            case 'dnd5e':
                system = new ConditionalVisibilitySystem5e();
                break;    
            case 'pf2e':
                system = new ConditionalVisibilitySystemPf2e();
                break;
            default:
                system = new DefaultConditionalVisibilitySystem();
        }        
        return system;
    }

    /**
     * Initializes the ConditionalVisibilitySystem.  Called from ready Hook.
     * @param sightLayer the slightlayer from the game system.
     * @param tokenHud the tokenHud to use.
     */
    static initialize(sightLayer: any, tokenHud: TokenHUD) {
        ConditionalVisibility.INSTANCE = new ConditionalVisibility(sightLayer, tokenHud);
        const facade:ConditionalVisibilityFacade  = new ConditionalVisibilityFacade(ConditionalVisibility.INSTANCE,
            ConditionalVisibility.INSTANCE._conditionalVisibilitySystem);
        //@ts-ignore
        window.ConditionalVisibility = facade;
        ConditionalVisibility.INSTANCE._conditionalVisibilitySystem.initializeHooks(facade);    
    }

    /**
     * Create a ConditionalVisibility with a given sightLayer and tokenHud.
     * @param sightLayer the sightLayer to use
     * @param tokenHud the tokenHud to use
     */
    private constructor(sightLayer: any, tokenHud: TokenHUD) {
        this._conditionalVisibilitySystem = ConditionalVisibility.newSystem();

        // v0.6 and v0.7 inspect the tokens in a sightLayer differently, so switch based on version
        this._isV7 = isNewerVersion(game.data.version, "0.7");
        if (this._isV7) {
            console.log(Constants.MODULE_NAME + " | starting against v0.7 or greater instance " + game.data.version);
            this._getSrcTokens = () => {
                let srcTokens = new Array<Token>();
                if (this._sightLayer.sources) {
                    for (const key of this._sightLayer.sources.keys()) {
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
                return srcTokens;
            }
            this._draw = async() => {
                await this._sightLayer.initialize();
                await this._sightLayer.refresh();
            }
        } else {
            console.log(Constants.MODULE_NAME + " | starting against v0.6 instance " + game.data.version);
            this._getSrcTokens = () => {
                let srcTokens = new Array<Token>();
                if (this._sightLayer.sources && this._sightLayer.sources.vision) {
                    for (const [key, source] of this._sightLayer.sources.vision) {
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
                return srcTokens;
            }
            this._draw = async() => {
                await this._sightLayer.initialize();
                await this._sightLayer.update();
            }
        }
        this._sightLayer = sightLayer;
        const realRestrictVisibility = sightLayer.restrictVisibility;    
        this._sightLayer.restrictVisibility = () => {
            realRestrictVisibility.call(this._sightLayer);

            const restricted = canvas.tokens.placeables.filter(token => token.visible);
            
            if (restricted && restricted.length > 0) {
                let srcTokens = this._getSrcTokens();
                
                if (srcTokens.length > 0) {
                    const flags: any = this._conditionalVisibilitySystem.getVisionCapabilities(srcTokens);
                    for (let t of restricted) {
                        if (srcTokens.indexOf(t) < 0) {
                            t.visible = this._conditionalVisibilitySystem.canSee(t, flags);
                        }
                    }
                }
            }
        }

        this._tokenHud = tokenHud;
        this._conditionalVisibilitySystem.initializeOnToggleEffect(this._tokenHud);

        game.socket.on("modifyEmbeddedDocument", async (message) => {
            const result = message.result.find(result => {
                return result.effects || (result.flags && result.flags[Constants.MODULE_NAME]);
            });

            if (this.shouldRedraw(result)) {
                await this.draw();
            }
        });
        // update sight layer, as custom decisons will not be executed the
        // first time through, and cannot be forced in setup
        this.draw();
    }

    public shouldRedraw(toTest: any):boolean {            
        return toTest != undefined && ((toTest.effects !== undefined) // && toTest.effects.some(effect => effect.indexOf(Constants.MODULE_NAME) > -1)) //TODO optimize, perhaps with flag dummy value?
            || (toTest.flags != undefined && toTest.flags[Constants.MODULE_NAME] != undefined));
    }

    public onRenderTokenConfig(tokenConfig: any, jQuery:JQuery, data: any) {
        const visionTab = $('div.tab[data-tab="vision"]');
        renderTemplate("modules/conditional-visibility/templates/extra_senses.html", tokenConfig.object.data.flags[Constants.MODULE_NAME] || {})
            .then(extraSenses => {
                visionTab.append(extraSenses);
            });
    }

    public onRenderTokenHUD(app, html, data) {
        const systemEffects = this._conditionalVisibilitySystem.effectsByIcon();
        html.find("img.effect-control")
            .each((idx, icon) => {
                const src = icon.attributes.src.value;
                if (systemEffects.has(src)) {
                    let title;
                    if (systemEffects.get(src) === 'hidden') {
                        //@ts-ignore
                        title = game.i18n.localize('CONVIS.' + systemEffects.get(src));
                        if (data.flags && data.flags[Constants.MODULE_NAME] 
                            && data.flags[Constants.MODULE_NAME]._ste && !isNaN(parseInt(data.flags[Constants.MODULE_NAME]._ste))) {
                            //@ts-ignore
                            title += ' ' + game.i18n.localize('CONVIS.currentstealth') + ': ' + data.flags[Constants.MODULE_NAME]._ste;
                        }
                    } else {
                        //@ts-ignore
                        title = game.i18n.localize('CONVIS.' + systemEffects.get(src));
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
                    currentStealth = parseInt(token.flags[Constants.MODULE_NAME]._ste);
                } catch (err) {
                    
                }

                if (currentStealth === undefined || isNaN(parseInt(currentStealth))) {
                } else {
                    if (!update.flags) {
                        update.flags = {};
                    }
                    if (!update.flags[Constants.MODULE_NAME]) {
                        update.flags[Constants.MODULE_NAME] = {};
                    }
                    update.flags[Constants.MODULE_NAME]._ste = currentStealth;
                }
            } else {
                if (!update.flags) {
                    update.flags = {};
                }
                if (!update.flags[Constants.MODULE_NAME]) {
                    update.flags[Constants.MODULE_NAME] = {};
                }
                update.flags[Constants.MODULE_NAME]._ste = "";
            }
            await this.draw();
        } else if (update.flags && update.flags[Constants.MODULE_NAME]) {
            await this.draw();
        }
    }

    private async draw() {
        this._draw();
    }
}
