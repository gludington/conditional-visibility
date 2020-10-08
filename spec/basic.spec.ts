import {ConditionalVisibilty } from '../src/module/ConditionalVisibility';

//@ts-ignore
(global as any).game = {
    data: { version: "0.6.6"},
    system: {id: 'asdf'},
    socket: { 
        on:jest.fn().mockImplementation((name, data) => {})
    }
};

//@ts-ignore
(global as any).CONFIG = {
    statusEffects: []
};

//@ts-ignore
(global as any).isNewerVersion = (version:string, base:string) => {
    return parseFloat(version) >= parseFloat(base);
}

describe('Setup - onInit', () => {

    afterEach(() => {
        CONFIG.statusEffects = [];
    });

    it('Establish three conditions for an unrecognized game system', () => {
        ConditionalVisibilty.onInit();
        expect(CONFIG.statusEffects.length).toBe(3);
        expect(CONFIG.statusEffects[0]).toBe('modules/conditional-visibility/icons/unknown.svg');
        expect(CONFIG.statusEffects[1]).toBe('modules/conditional-visibility/icons/foggy.svg');
        expect(CONFIG.statusEffects[2]).toBe('modules/conditional-visibility/icons/moon.svg');
    });

    it('Establish four conditions for dnd5e', () => {
        game.system.id = "dnd5e";
        ConditionalVisibilty.onInit();
        expect(CONFIG.statusEffects.length).toBe(4);
        expect(CONFIG.statusEffects[0]).toBe('modules/conditional-visibility/icons/unknown.svg');
        expect(CONFIG.statusEffects[1]).toBe('modules/conditional-visibility/icons/foggy.svg');
        expect(CONFIG.statusEffects[2]).toBe('modules/conditional-visibility/icons/moon.svg');
        expect(CONFIG.statusEffects[3]).toBe('modules/conditional-visibility/icons/newspaper.svg');
    });

    it('Establish one condition for pf2e', () => {
        game.system.id = "pf2e";
        ConditionalVisibilty.onInit();
        expect(CONFIG.statusEffects.length).toBe(1);
        expect(CONFIG.statusEffects[0]).toBe('systems/pf2e/icons/conditions-2/invisible.png');
    });
});

describe('Ready - initialize', () => {
    const sightLayer:any = {
        initialize: jest.fn().mockResolvedValue(43),
        refresh: jest.fn().mockResolvedValue(43),
        update: jest.fn().mockResolvedValue(43)
    };
    const tokenHud:any = {};
    it('it should set up a listener for modifyEmbeddedDocument and redraw', () => {
        ConditionalVisibilty.initialize(sightLayer, tokenHud);
        //@ts-ignore
        expect(ConditionalVisibilty.INSTANCE._isV7).toBe(false);
        expect(game.socket.on).toHaveBeenCalledWith("modifyEmbeddedDocument", expect.any(Function));
        expect(sightLayer.initialize).toHaveBeenCalled();
        expect(sightLayer.refresh).not.toHaveBeenCalled();
        //TODO 2nd mock not getting called?
        //expect(sightLayer.update).toHaveBeenCalled();
    })
});

describe("shouldRedraw", () => {

    beforeEach(() => {
        const sightLayer:any = {
            initialize: jest.fn().mockResolvedValue(43),
            refresh: jest.fn().mockResolvedValue(43),
            update: jest.fn().mockResolvedValue(43)
        };
        const tokenHud:any = {};
        ConditionalVisibilty.initialize(sightLayer, tokenHud);
    });

    it ("Should not redraw on a null change", () => {
        const toTest = {};
        expect(ConditionalVisibilty.INSTANCE.shouldRedraw(toTest)).toBe(false);
    });

    it ("Should redraw on adding an effects change", () => {
        const toTest = { effects: []};
        expect(ConditionalVisibilty.INSTANCE.shouldRedraw(toTest)).toBe(true);
    });

    it ("Should not redraw on adding with no module flags change", () => {
        const toTest = { flags: {}};
        expect(ConditionalVisibilty.INSTANCE.shouldRedraw(toTest)).toBe(false);
    });

    it ("Should redraw on adding with module flags change", () => {
        const toTest = { flags: {'conditional-visibility': {}}};
        expect(ConditionalVisibilty.INSTANCE.shouldRedraw(toTest)).toBe(true);
    });
});