interface StatusCondition {
    code: string,
    name: string
}

class ConditionalVisibilityHud extends FormApplication {

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "/modules/conditional-visibility/templates/visible_conditions.html";
        options.width = 600;
        options.height = "auto";
        options.title = game.i18n.format("CONVIS.visibilityConditions", {});
        options.submitOnClose = true;
        options.id = "senses-visible-container";
        return options;
    }

    private _statusConditions: Array<StatusCondition>[];
    private _tokenId:string;
    private _current: any;

    constructor(tokenId, options) {
        super(tokenId, {});
        this._tokenId = tokenId;
        this._current = options.current;
        this._statusConditions = options.statusConditions;
    }

    async getData() {

        const actors:any = [];
        for (let actor of game.actors.values()) {
            //@ts-ignore
            if (actor.data.type === 'character') {
                actors.push({
                    //@ts-ignore
                    code: actor._id,
                    //@ts-ignore
                    name: actor.data.name
                })
            }
        }
        return {
            statusConditions: this._statusConditions,
            characters: actors
        }
    }

    async _updateObject(event, formData) {
        const statusConditions = [];
        const characters = [];

        Object.keys(formData).forEach((key => {
            if (formData[key] === true) {
                //@ts-ignore
                if (key.startsWith("characters.")) {
                    if (formData[key] === true) {
                        characters.push(key.substring("characters.".length));
                    }
                } else {
                  statusConditions.push(key);
                }
            }
        }));


    const toChange:Token = canvas.tokens.get(this._tokenId);

        if (statusConditions.length > 0) {
            await toChange.setFlag(ConditionalVisibilty.MODULE_NAME, "statusConditions", statusConditions);
        } else {
            await toChange.unsetFlag(ConditionalVisibilty.MODULE_NAME, "statusConditions");
        }
        if (characters.length > 0) {
          await toChange.setFlag(ConditionalVisibilty.MODULE_NAME, "characters", characters);
      } else {
          await toChange.unsetFlag(ConditionalVisibilty.MODULE_NAME, "characters");
      }
        return;
    }

    activateListeners(html) {
        super.activateListeners(html)
        const fields = $("input.SENSES-checked");
    }

    /**
     * Taken from Foundry.js line 18579
     */
    _onSourceChange(event) {
        event.preventDefault();
        const field = event.target;
        const form = field.form;
        if (!form.name.value) form.name.value = field.value.split("/").pop().split(".").shift();
    }
}

export class ConditionalVisibilty {

    static MODULE_NAME:string = "conditional-visibility";

    sightLayer: any;

    _statusConditions:Array<StatusCondition>;

    constructor(sightLayer: any) {
        this.sightLayer = sightLayer;
        this._statusConditions = new Array();
        this._statusConditions.push({ code: "invisible", name:"Invisibility"});
        this._statusConditions.push({ code: "ethereal", name:"Ethereal"});
        this._statusConditions.push({ code: "obscured", name:"Obscured"});
        this._statusConditions.push({ code: "indarkness", name:"In Magical Darkness"});
        this._statusConditions.push({ code: "hiding", name:"Hiding"});
    }

    public test(viewer:Token, viewee:Token):boolean {
        if (viewer === viewee) { //can always see self
            return true;
        }
        const conditions = viewee.getFlag(ConditionalVisibilty.MODULE_NAME, "reqs");
        console.error(conditions);
        debugger;
        if (!conditions || conditions.length == 0) {
            return true;
        }
        return true;
    }

    public async showHud(tokenHUD:any, html:JQuery, data:any) {
        
        // The Icon you want to add to the HUD
        const visibleConditionsBtn = $('<i title="Conditions for Visibility" class="control-icon fa fa-eye" ></i>');

        // Add to right or left side of hud
        html.find(".right").prepend(visibleConditionsBtn);

        new ConditionalVisibilityHud(data._id, {
            html:html,
            statusConditions: this._statusConditions,
            current: data.flags[ConditionalVisibilty.MODULE_NAME]
        }).render(true)
    }
}
