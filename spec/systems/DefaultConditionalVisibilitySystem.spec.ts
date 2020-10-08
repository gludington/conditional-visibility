import {DefaultConditionalVisibilitySystem } from '../../src/module/systems/DefaultConditionalVisibilitySystem';
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

describe('DefaultConditionaVisibilitySystem', () => {

    const system:DefaultConditionalVisibilitySystem = new DefaultConditionalVisibilitySystem();
    it('Establishes three conditions for an unrecognized game system', () => {
        const effects:Map<String, String> = system.effects();
        expect(effects.size).toBe(3);
        expect(effects.get('modules/conditional-visibility/icons/unknown.svg')).toBe('invisible');
        expect(effects.get('modules/conditional-visibility/icons/foggy.svg')).toBe('obscured');
        expect(effects.get('modules/conditional-visibility/icons/moon.svg')).toBe('indarkness');
    });

    it('Treats a token without flags as having no extra senses', () => {
        const token:any = {
            data: {
                flags: {
                    'conditional-visibility': {}
                }
            }
        };

        const flags = system.getVisionCapabilities([token]);
        expect(flags.seeinvisible).toBe(false);
        expect(flags.seeobscured).toBe(false);
        expect(flags.seeindarkness).toBe(false);   
    });

    it('Treats a token with flags as having extra sense for that flag', () => {
        const token:any = {
            data: {
                flags: {
                    'conditional-visibility': { seeinvisible:true}
                }
            }
        };

        const flags = system.getVisionCapabilities([token]);
        expect(flags.seeinvisible).toBe(true);
        expect(flags.seeobscured).toBe(false);
        expect(flags.seeindarkness).toBe(false);   
    });

    it('Combines all token senses for flags', () => {
        const token1:any = {
            data: {
                flags: {
                    'conditional-visibility': { seeinvisible:true}
                }
            }
        };
        const token2:any = {
            data: {
                flags: {
                    'conditional-visibility': { devilssight:true}
                }
            }
        };
        const flags = system.getVisionCapabilities([token1, token2]);
        expect(flags.seeinvisible).toBe(true);
        expect(flags.seeobscured).toBe(false);
        expect(flags.seeindarkness).toBe(true);   
    });
});