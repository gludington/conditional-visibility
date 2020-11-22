import {ConditionalVisibility } from '../src/module/ConditionalVisibility';

//@ts-ignore
(global as any).game = {
    data: { version: "0.7.6"},
    system: {id: 'asdf'},
    socket: { 
        on:jest.fn().mockImplementation((name, data) => {})
    }
};

//@ts-ignore
(global as any).CONFIG = {
    statusEffects: [],
};
class Token {
    private _isVisible;
    get isVisible(): boolean {
        return this._isVisible;
    }
}

//@ts-ignore
(global as any).Token = Token;

describe('Setup - onInit', () => {

    afterEach(() => {
        CONFIG.statusEffects = [];
    });

    it('Establish three conditions for an unrecognized game system', () => {
        ConditionalVisibility.onInit();
        expect(CONFIG.statusEffects.length).toBe(3);
        expect(CONFIG.statusEffects[0].icon).toBe('modules/conditional-visibility/icons/unknown.svg');
        expect(CONFIG.statusEffects[1].icon).toBe('modules/conditional-visibility/icons/foggy.svg');
        expect(CONFIG.statusEffects[2].icon).toBe('modules/conditional-visibility/icons/moon.svg');
    });

    it('Establish four conditions for dnd5e', () => {
        game.system.id = "dnd5e";
        ConditionalVisibility.onInit();
        expect(CONFIG.statusEffects.length).toBe(4);
        expect(CONFIG.statusEffects[0].icon).toBe('modules/conditional-visibility/icons/unknown.svg');
        expect(CONFIG.statusEffects[1].icon).toBe('modules/conditional-visibility/icons/foggy.svg');
        expect(CONFIG.statusEffects[2].icon).toBe('modules/conditional-visibility/icons/moon.svg');
        expect(CONFIG.statusEffects[3].icon).toBe('modules/conditional-visibility/icons/newspaper.svg');
    });

    it('Establish one condition for pf2e', () => {
        game.system.id = "pf2e";
        ConditionalVisibility.onInit();
        expect(CONFIG.statusEffects.length).toBe(1);
        expect(CONFIG.statusEffects[0].icon).toBe('systems/pf2e/icons/conditions-2/invisible.png');
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
        ConditionalVisibility.initialize(sightLayer, tokenHud);
        expect(game.socket.on).toHaveBeenCalledWith("modifyEmbeddedDocument", expect.any(Function));
        expect(sightLayer.initialize).toHaveBeenCalled();
        expect(sightLayer.refresh).not.toHaveBeenCalled();
        //TODO 2nd mock not getting called?
        //expect(sightLayer.update).toHaveBeenCalled();
    })
});