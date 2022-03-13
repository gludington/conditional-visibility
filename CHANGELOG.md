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