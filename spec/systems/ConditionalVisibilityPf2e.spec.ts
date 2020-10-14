import {ConditionalVisibilitySystemPf2e } from '../../src/module/systems/ConditionalVisibilitySystemPf2e';
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

describe('ConditionalVisibilitySystem5e', () => {

    const system:ConditionalVisibilitySystemPf2e = new ConditionalVisibilitySystemPf2e();

    describe('Setup', () => {
        it('Establishes one condition for pf2e', () => {
            const effects:Map<string, string> = system.effectsByIcon();
            expect(effects.size).toBe(1);
            expect(effects.get('systems/pf2e/icons/conditions-2/invisible.png')).toBe('invisible');
        });
    });

    describe('if token is invisible', () => {
            
        let flags:any = {};
        let token:any = { data: { effects:[]}};

        beforeEach(() => {
            flags = {};
            token = { data: { effects:['systems/pf2e/icons/conditions-2/invisible.png']}};
        });

        it ('empty capabilities cannot see it', () => {
            flags.seeinvisible = false;
            //@ts-ignore
            expect(system.seeInvisible(token, token.data.effects, flags)).toBe(false);
        });

        it ('seeinvisible can see it', () => {
            flags.seeinvisible = true;
            //@ts-ignore
            expect(system.seeInvisible(token, token.data.effects, flags)).toBe(true);
        }); 
        it ('seeobscured cannot see it', () => {
            flags.seeobscured = true;
            //@ts-ignore
            expect(system.seeInvisible(token, token.data.effects, flags)).toBe(false);
        }); 
        it ('seeindarkness cannot see it', () => {
            flags.seeobscured = true;
            //@ts-ignore
            expect(system.seeInvisible(token, token.data.effects, flags)).toBe(false);
        }); 
    });
});