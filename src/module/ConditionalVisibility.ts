interface SenseTest {
    code: string,
    name: string,
    has: (viewer:Token, viewee:Token) => boolean;
}

export class OwnedItemTest {
    
    private _code: string
    private _name: string
    private _ownedItemName: string

    constructor(code: string, name: string, ownedItemName:string) {
        this._code = code;
        this._name = name;
        this._ownedItemName = ownedItemName;
    }

    public get code() {
        return this._code;
    }

    public get name() {
        return this._name;
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
        options.title = game.i18n.format("SENSES.visibleTo", {});
        options.submitOnClose = true;
        options.id = "senses-visible-container";
        return options;
    }

    private _tests:[];
    private _sightLayer: any;
    private _tokenId:string;

    constructor(tokenId, options) {
        super(tokenId, {});
        this._tokenId = tokenId;
        this._tests = options.senses.testArray;
        this._sightLayer = options.senses.sightLayer;
    }

    async getData() {

        return {
            tests: this._tests
        }
    }

    async _updateObject(event, formData) {
        const requires = [];
        Object.keys(formData).forEach((key => {
            if (formData[key] === true) {
                //@ts-ignore
                requires.push(key);
            }
        }))
        const toChange:Token = canvas.tokens.get(this._tokenId);
        if (requires.length > 0) {
            await toChange.setFlag(ConditionalVisibilty.MODULE_NAME, "reqs", requires);
        } else {
            await toChange.unsetFlag(ConditionalVisibilty.MODULE_NAME, "reqs");
        }
       this._sightLayer.update(); 
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
    testArray: any;

    constructor(sightLayer: any) {
        this.sightLayer = sightLayer;
        this.tests = new Map();
        const ds: OwnedItemTest = new OwnedItemTest("devilssight", "Devil's Sight", "Invocation: Devil's Sight");
        this.tests.set(ds.code, ds);
        this.testArray = [];
        this.tests.forEach((value: SenseTest, key: string) => {
            this.testArray.push({
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
            requires: data.flags.senses && data.flags.senses.reqs ? data.flags.senses.reqs : [],
            senses: this
        }).render(true)
    }
}
