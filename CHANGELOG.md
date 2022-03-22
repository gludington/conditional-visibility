### 0.5.1-2-3-4-5

- Some bug fix
- Remove all forEach fro performance
- Add some old api for retrocomaptibility

### 0.5.0 [BREKING CHANGES]

- Rewriting the logic for a better workflow

### 0.4.29-30-31-32-33-34-35-36-37-38

- Bug fix

### 0.4.28

- Add warning on the hud form
- Bug fix missing `effect.flags.core.statusId` on the effect used, becuase is mandatory for the moduel i will create this runtime 
- Bug gix [[BUG] Token Action HUD and Auto Stealth not working](https://github.com/p4535992/conditional-visibility/issues/11)
- Bug fix [[BUG] Removing invisible from a hostile token causes errors on client side and doesn't make them visible](https://github.com/p4535992/conditional-visibility/issues/12)
- Is impossibile to make the auto stealth work with other module like token action hud, LMRTFY or similar module in a multisystem enviroment, so now i just rendered the chat and hope everything is working like expected, so if no chat is been rendered on the client side no stealth effect is applied and you are force to use the token hud feature.

### 0.4.27

- Update lang

### 0.4.26

- Bug fix for check with passice perception when no source sense is present
- Bug fix when the effect is not recover from the dfred convinient effect store

### 0.4.25 [BREAKING CHANGES]

- Add new active effect change `ATCV.conditionType` for indicate the type of CV usually they are or 'sense' or 'condition' not both, **THIS IS ESSENTIAL FOR USE SENSE AND CONDITION NOT REGISTERED ON THE MODULE IF NOT FOUNDED BY DEFAULT IS CONSIDERED A SENSE**, so now you can just modify the AE and you are not forced to call the registered macro of the module CV, this is very useful for integration with other modules.
- Add new active effect change `ATCV.conditionLevelMinIndex` and `ATCV.conditionLevelMaxIndex` for setup range of senses and coditions, you mus use some math for get what you want.
- First integration for full customize the AE with custom icon path, ecc. if not found the default preset is been loaded.
- Big clean up of the code , should be faster and better now...
- Many bug fix

### 0.4.24

- (Again) Bug fix multiple AE for missed unsetflag when delete a AE
- Removed refresh function seem not necessary anymore

### 0.4.23

- Buf fix multiple AE for missed unsetflag when delete a AE

### 0.4.22

- Some bug fix
- Autostealth now it should work like expected

### 0.4.21

- Rename all effects with suffix `(CV)`, for better clarification with other modules

### 0.4.20

- Some bug fix
- Add hook for when you add the active effect

### 0.4.19

- Add new active effect change `ATCV.conditionDistance` for a distance check to add to the active effect.

### 0.4.15-16-17-18 [BETA READY]

- Complete rewrite of the code,api desgin pattern ecc.
- For backward compatibility and integration with the Levels module, the new logic must remain bound to the flags already existing in the current module.
- Sync the status with the flags on the token, the checking of the visibility, if I can or cannot see the certain thing is currently bound to the values of the flags, with the new version for a better management of the thing each flag is associated with an AE, so if a token a l'active effects "Truesight" can see tokens that have the "Invisibility" active effects and that they usually shouldn't see.
- Integration with the [DfFred Convenient Effects module](https://github.com/DFreds/dfreds-convenient-effects) with the will gonna be [api](https://github.com/DFreds/dfreds-convenient-effects/issues/110)
- Possible integration with perfect vision.
- Hope to have a multisystem integration, but for now PF2, DND5e are the first one requested.
- Possible integration with the [levels](https://github.com/theripper93/Levels) it's seem to be the right road to follow, we can use the method `overrideVisibilityTest(sourceToken, token){}` of levels for override the levels visibility test.

### 0.4.13-14

- bug fixing, update instead remove the effect

### 0.4.9

- Bug fixing recovery actor from token

### 0.4.8

- Bug fixing recovery actor from token

### 0.4.7

- Bug fixing recovery actro from token

### 0.4.6

- Beta ready for feedback
