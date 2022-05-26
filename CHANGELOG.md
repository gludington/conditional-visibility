### 0.5.41

- Added a very poor button for add and remove sense/condition on the token configuration
- Bug fix now the tokens should hide when disabled the active effect condition
- Other minor bug fix

### 0.5.40

- Add `ATCV.conditionBlinded` and `ATCV.conditionBlindedOverride` condtions for [https://github.com/p4535992/conditional-visibility/issues/32](https://github.com/p4535992/conditional-visibility/issues/32)
- Clean up comments
- Add module settins for hud position [Option for changing CV's HUD button position](https://github.com/p4535992/conditional-visibility/issues/34)
- Bug fix: [[BUG] Duplicate token configuration panel and some sight issue bug](https://github.com/p4535992/conditional-visibility/issues/29)
- Add class field to extra_sense template
- Update renderChat for autostealth for mutliligual (the community need to pr me a language file)

### 0.5.39

- Bug fix on the elevation method utility
- Remove module settigns 'enableFastModeCVHandler' we can't avoid the checker
- Add module settings 'enableRefreshSightCVHandler'

### 0.5.38

- Bug fix [[BUG] Stuck flags](https://github.com/p4535992/conditional-visibility/issues/30)
- Add macro `cleanUpTokenSelectedOnlyCVData` for clean up `data` flags if the solution doen's work 

### 0.5.37

- Integration autostealth with better rolls
- Resolved winking by disable the 'SightLayer.prototype.tokenVision' wrapper (maybe ???)
- Update the checker again
- Give up on understand how the community want to manage the passive stealth on Dnd5e, because of this i create a new active effect 'Stealthed' so everyone can apply is own custom solution. So now you can apply any combination of 'Hidden' vs 'Stealthed' and simply disable or remove the active effect if you don't want to check the visibility. For moredetails check out the token configuration panel.
- Update compatibility with new 'Levels' losHeight function
- Buf fix for 'Auto Stealth' and update token vs update actor
- Add a clean up macro on the module for remove the old flag per midi integration
- [BREAKING CHANGES] You must reset the module settings with the dedicate button on the module settings panel for apply the new active effect stealthed
- Added  a new experimental module setting "Fast Mode" module setting, for anyone have some latency problem ? With this the only the time used for the check is the time used for find a value on a map javascript with a key (so it should be faster).

### 0.5.36

- Added "Fast Mode" module setting.
- Some bugfix (actorData patch and disable active effect)

### 0.5.35

-Some clean up

### 0.5.34

- Integration autostealth with better rolls
- Resolved winking by disable the `SightLayer.prototype.tokenVision` wrapper
- Update the checker again
- Added the flag `Use stealth passive` to activated this tokne by token so everyone in Dnd5e is happy now ? 

### 0.5.33

- Bug fix enable and disable CV active effect

### 0.5.32

- Solved hidden door bug 

### 0.5.31

- Add some debug info
- Add retrocompatibility code (it will slow down the checker)

### 0.5.30

- Add some debug info
- Clean up code

### 0.5.29

- Solved hidden door ???

### 0.5.28

- Solved starnge loop case by forcing a check during the update of the active effect ???

### 0.5.27

- Disable HUD for loop

### 0.5.23-24-25-26

- Bug fix on unset flag and repair method

### 0.5.22

- Solved https://github.com/p4535992/conditional-visibility/issues/25
- Possibily solved https://github.com/p4535992/conditional-visibility/issues/24
- Possibly solved https://github.com/p4535992/conditional-visibility/issues/12#issuecomment-1083758580

### 0.5.21 [BREAKING CHANGE]

- Add 'Force Visible' checkbox on token configuration, for avoid the checks of CV on specific token
- Try again solved the issue User lacks permission to update Token in parent Scene (maybe ?)
- Remove `canvas.perception.schedule` it's seem there is a lag problem i cannot solve [High token count](https://github.com/p4535992/conditional-visibility/issues/24)
- Full rewrite of the checker (version 2), max velocity now for support abnorm number of token wihtout walls between them.

### 0.5.20

- Buf fix [[BUG] 'Disable for Non-Hostile' disables Conditional Visibility's hiding of tokens for all tokens]](https://github.com/p4535992/conditional-visibility/issues/23)
- Remove `canvas.perception.schedule` it's seem there is a lag problem i cannot solve [High token count](https://github.com/p4535992/conditional-visibility/issues/24)

### 0.5.19

- Big update transfer all the flags from `token.data.flags` to `token.actor.data.flags`. 

### 0.5.13-14-15-16-17-18

- Solved loop on mutliple delete active effect
- Little bug fix 
- Integration with mid-qol optional rule, when a token make a attack it will visible for the duration of the attack.

### 0.5.12

- Solved module incompatibility with [Less Fog](https://github.com/trdischat/lessfog/)
- Add check only for condition and sense effect not disable, now if the effect is disabled is not consider from the checker very useful whith [Dfreds Panel Effects](https://github.com/DFreds/dfreds-effects-panel)
- Moved all the initialization to the init hook and made it non-async, because the hooks/wrappers/settings need to be registered before the canvas is drawn. This fixes the issue that the tokens are initially visible after login.

### 0.5.7-8-9-10-11

- Apply integration with `data.attributes.sense` for dnd5 systerm
- Some bug fix

### 0.5.1-2-3-4-5-6

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
