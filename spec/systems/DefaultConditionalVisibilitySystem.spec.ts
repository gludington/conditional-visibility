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

    describe('Setup', () => {
        it('Establishes three conditions for an unrecognized game system', () => {
            const effects:Map<String, String> = system.effects();
            expect(effects.size).toBe(3);
            expect(effects.get('modules/conditional-visibility/icons/unknown.svg')).toBe('invisible');
            expect(effects.get('modules/conditional-visibility/icons/foggy.svg')).toBe('obscured');
            expect(effects.get('modules/conditional-visibility/icons/moon.svg')).toBe('indarkness');
        });
    });

    describe('Creating vision capabilities for a token', () => {
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

    describe('Testing if something is visible', () => {
        let flags:any = {};
        let token:any = { data: { effects:[]}};

        it('if token has no effects, no flags are needed to see', () => {
            //@ts-ignore
            expect(system.seeInvisible(token, token.data.effects, flags)).toBe(true);
            //@ts-ignore
            expect(system.seeObscured(token, token.data.effects, flags)).toBe(true);
            //@ts-ignore
            expect(system.seeInDarkness(token, token.data.effects, flags)).toBe(true);
            //@ts-ignore
            expect(system.seeContested(token, token.data.effects, flags)).toBe(true);
            expect(system.canSee(token, flags)).toBe(true);
        });

        describe('if a token has multiple effects', () => {
            
            beforeEach(() => {
                flags = {};
                token = { data: { effects:['modules/conditional-visibility/icons/unknown.svg',
                'modules/conditional-visibility/icons/foggy.svg']}};
            });

            it('having one of the flags will not see it', () => {
                flags.seeinvisible = true;
                expect(system.canSee(token, flags)).toBe(false);
            });

            it('having the other one of the flags will not see it', () => {
                flags.seeobscured = true;
                expect(system.canSee(token, flags)).toBe(false);
            });

            it('having both flags will see it', () => {
                flags.seeobscured = true;
                flags.seeinvisible = true;
                expect(system.canSee(token, flags)).toBe(true);
            })
        });

        describe('if token is invisible', () => {
            
            beforeEach(() => {
                flags = {};
                token = { data: { effects:['modules/conditional-visibility/icons/unknown.svg']}};
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

        describe('if token is obscured', () => {
            
            beforeEach(() => {
                flags = {};
                token = { data: { effects:['modules/conditional-visibility/icons/foggy.svg']}};
            });

            it ('empty capabilities cannot see it', () => {
                flags.seeinvisible = false;
                //@ts-ignore
                expect(system.seeObscured(token, token.data.effects, flags)).toBe(false);
            });

            it ('seeinvisible cannot see it', () => {
                flags.seeinvisible = true;
                //@ts-ignore
                expect(system.seeObscured(token, token.data.effects, flags)).toBe(false);
            }); 
            it ('seeobscured can see it', () => {
                flags.seeobscured = true;
                //@ts-ignore
                expect(system.seeObscured(token, token.data.effects, flags)).toBe(true);
            }); 
            it ('seeindarkness cannot see it', () => {
                flags.seeindarkness = true;
                //@ts-ignore
                expect(system.seeObscured(token, token.data.effects, flags)).toBe(false);
            }); 
        });

        describe('if token is in darkness', () => {   
            beforeEach(() => {
                flags = {};
                token = { data: { effects:['modules/conditional-visibility/icons/moon.svg']}};
            });

            it ('empty capabilities cannot see it', () => {
                //@ts-ignore
                expect(system.seeInDarkness(token, token.data.effects, flags)).toBe(false);
            });

            it ('seeinvisible cannot see it', () => {
                flags.seeinvisible = true;
                //@ts-ignore
                expect(system.seeInDarkness(token, token.data.effects, flags)).toBe(false);
            }); 
            it ('seeobscured cannot see it', () => {
                flags.seeobscured = true;
                //@ts-ignore
                expect(system.seeInDarkness(token, token.data.effects, flags)).toBe(false);
            }); 
            it ('seeindarkness can see it', () => {
                flags.seeindarkness = true;
                //@ts-ignore
                expect(system.seeInDarkness(token, token.data.effects, flags)).toBe(true);
            }); 
        });
    })
});