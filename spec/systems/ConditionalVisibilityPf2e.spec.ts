import { ConditionalVisibility } from '../../src/module/ConditionalVisibility';
import { StatusEffect } from '../../src/module/Constants';
import {ConditionalVisibilitySystemPf2e } from '../../src/module/systems/ConditionalVisibilitySystemPf2e';
//@ts-ignore
(global as any).game = {
    data: { version: "0.7.6"},
    system: {id: 'pf2e'},
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

describe('ConditionalVisibilitySystemPf2e', () => {

    //@ts-ignore
    const system:ConditionalVisibilitySystemPf2e = ConditionalVisibility.newSystem();

    describe('Setup', () => {
        it('Establishes one condition for pf2e', () => {
            const effects:Map<string, StatusEffect> = system.effectsByIcon();
            expect(effects.size).toBe(1);
            expect(effects.get('systems/pf2e/icons/conditions-2/invisible.png').id).toBe('conditional-visibility.invisible');
        });
    });

    describe('if token is invisible', () => {
            
        let flags:any = {};
        let token:any = { data : { flags: {
            'conditional-visibility': { 'invisible':true }
        }}};

        beforeEach(() => {
            flags = {};
        });

        it ('empty capabilities cannot see it', () => {
            flags= {}
            //@ts-ignore
            expect(system.seeInvisible(token, flags)).toBe(false);
        });

        it ('seeinvisible can see it', () => {
            flags = {seeinvisible: true};
            //@ts-ignore
            expect(system.seeInvisible(token, flags)).toBe(true);
        }); 
        it ('seeobscured cannot see it', () => {
            flags = {seeobscured: true};
            //@ts-ignore
            expect(system.seeInvisible(token, flags)).toBe(false);
        }); 
        it ('seeindarkness cannot see it', () => {
            flags = {seeindarkness: true};
            //@ts-ignore
            expect(system.seeInvisible(token, flags)).toBe(false);
        }); 
    });
});