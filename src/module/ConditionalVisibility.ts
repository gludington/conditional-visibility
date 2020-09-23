interface SenseTest {
    code: string,
    name: string,
    has: (viewer:Token, viewee:Token) => boolean;
}

export class OwnedItemTest {
    
    private _code: string
    private _ownedItemName: string

    constructor(code: string, ownedItemName:string) {
        this._code = code;
        this._ownedItemName = ownedItemName;
    }

    public get code() {
        return this._code;
    }

    public get name() {
        return this._ownedItemName;
    }

    public get ownedItemName() {
        return this._ownedItemName;
    }

    has(viewer:Token, viewee:Token): boolean {
        return viewer && viewer.actor && viewer.actor.getEmbeddedCollection('OwnedItem').some(oe => oe.name === this.ownedItemName);
    }
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

    private _ownedItemTests:[];
    private _tokenId:string;
    private _current: any;

    constructor(tokenId, options) {
        super(tokenId, {});
        this._tokenId = tokenId;
        this._current = options.current;
        this._ownedItemTests = options.ownedItemTests;
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
            ownedItemTests: this._ownedItemTests,
            characters: actors
        }
    }

    async _updateObject(event, formData) {
        const requires = {
            ownedItems: [],
            characters: []
        };

        Object.keys(formData).forEach((key => {
            if (formData[key] === true) {
                //@ts-ignore
                if (key.startsWith("characters.")) {
                    if (formData[key] === true) {
                        requires.characters.push(key.substring("characters.".length));
                    }
                } else {
                    requires.ownedItems.push(key);
                }
            }
        }));


        const toChange:Token = canvas.tokens.get(this._tokenId);
        if (requires.ownedItems.length > 0 || requires.characters.length > 0) {
            await toChange.setFlag(ConditionalVisibilty.MODULE_NAME, "reqs", requires);
        } else {
            await toChange.unsetFlag(ConditionalVisibilty.MODULE_NAME, "reqs");
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
    tests: Map<string, SenseTest>;
    ownedItemTests: any;
    tokenVisionTests: any;

    constructor(sightLayer: any) {
        this.sightLayer = sightLayer;
        this.tests = new Map();
        const ds: OwnedItemTest = new OwnedItemTest("devilssight", "Invocation: Devil's Sight");
        this.tests.set(ds.code, ds);
        this.ownedItemTests = [];
        this.tokenVisionTests = [];
        this.tests.forEach((value: SenseTest, key: string) => {
            this.ownedItemTests.push({
                code: value.code,
                name: value.name
            })
        });
    }

    public test(viewer:Token, viewee:Token):boolean {
        if (viewer === viewee) { //can always see self
            return true;
        }
        const conditions = viewee.getFlag(ConditionalVisibilty.MODULE_NAME, "reqs");
        if (!conditions || conditions.length == 0) {
            return true;
        }
        return conditions.some(condition => {
            return this.tests.get(condition) && this.tests.get(condition)?.has(viewer, viewee);
        })
    }

    public async showHud(tokenHUD:any, html:JQuery, data:any) {
        
        // The Icon you want to add to the HUD
        const visibleConditionsBtn = $('<i title="Conditions for Visibility" class="control-icon fa fa-eye" ></i>');

        // Add to right or left side of hud
        html.find(".right").prepend(visibleConditionsBtn);

        new ConditionalVisibilityHud(data._id, {
            html:html,
            current: data.flags[ConditionalVisibilty.MODULE_NAME],
            ownedItemTests: this.ownedItemTests
        }).render(true)
    }
}
