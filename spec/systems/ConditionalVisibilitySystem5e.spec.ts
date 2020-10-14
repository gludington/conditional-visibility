import {ConditionalVisibilitySystem5e } from '../../src/module/systems/ConditionalVisibilitySystem5e';
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

    const system:ConditionalVisibilitySystem5e = new ConditionalVisibilitySystem5e();

    describe('Setup', () => {
        it('Establishes four conditions for dnd5e', () => {
            const effects:Map<string, string> = system.effectsByIcon();
            expect(effects.size).toBe(4);
            expect(effects.get('modules/conditional-visibility/icons/unknown.svg')).toBe('invisible');
            expect(effects.get('modules/conditional-visibility/icons/foggy.svg')).toBe('obscured');
            expect(effects.get('modules/conditional-visibility/icons/moon.svg')).toBe('indarkness');
            expect(effects.get('modules/conditional-visibility/icons/newspaper.svg')).toBe('hidden');
        });
    });

    describe('Creating vision capabilities for a token', () => {
        it('Creates a -1 prc value if there is no actor with passive perception attached', () => {
            const token:any = {
                data: {
                    flags: {
                        'conditional-visibility': {}
                    }
                }
            };

            const flags = system.getVisionCapabilities([token]);
            expect(flags.prc).toBe(-1);
        });

        it('Creates a prc value from actors passive perception', () => {
            const token:any = {
                data: {
                    flags: {
                        'conditional-visibility': { _ste: 10 }
                    }
                }, 
                actor: {
                    data: {
                        data: {
                            skills: {
                                prc: {
                                    passive: 12
                                }
                            }
                        }
                    }
                }
            };

            const flags = system.getVisionCapabilities([token]);
            expect(flags.prc).toBe(12);
        });
    });

    describe('Contested Test', () => {
        let flags:any = { prc: 12};
        let token:any = { data: { effects:['modules/conditional-visibility/icons/newspaper.svg']}};

        it('stealth higher than the prc cannot be seen', () => {
            token.data.flags = { 'conditional-visibility': { _ste: 15}}
            //@ts-ignore
            expect(system.seeContested(token, token.data.effects, flags)).toBe(false);
            expect(system.canSee(token, flags)).toBe(false);
        });

        it('stealth equal to the prc can be seen', () => {
            token.data.flags = { 'conditional-visibility': { _ste: 12}}
            //@ts-ignore
            expect(system.seeContested(token, token.data.effects, flags)).toBe(true);
            expect(system.canSee(token, flags)).toBe(true);
        });

        it('stealth lower than the prc can be seen', () => {
            token.data.flags = { 'conditional-visibility': { _ste: 10}}
            //@ts-ignore
            expect(system.seeContested(token, token.data.effects, flags)).toBe(true);
            expect(system.canSee(token, flags)).toBe(true);
        });
       
    });
});