# Changelog

## [0.2.2]

- Very special ty to [Szefo09](https://github.com/szefo09) for make implemented a [debouncing functionality for CV](https://github.com/szefo09/conditional-visibility/commit/c2f3b9aa20d3bf4c37aec8e9eaf83b76bd532521)
What this does is, if multiple tokens get CV effects (for example via Active Auras module), it will take all the changes and bulk apply them after a set delay, so that it won't flood the database with small changes with race condition.

## [0.2.1]

- Very special ty to [Teshynil](https://github.com/Teshynil) for make many and many test with bug fix

## [0.2.0] (BETA)

- Made functional with Foundry 0.8.6 (maybe)
- Bootstrapped with League of Extraordinary FoundryVTT Developers  [foundry-vtt-types](https://github.com/League-of-Foundry-Developers/foundry-vtt-types)
- Added [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/)
- Very special ty to [Szefo09](https://github.com/szefo09) for make full operational patch for Dnd5e

## [0.1.5]

-  Made functional with Foundry 0.7.9
-  Bootstrapped with League of Extraordinary FoundryVTT Developers  [foundry-vtt-types](https://github.com/League-of-Foundry-Developers/foundry-vtt-types).

## [0.1.4]
- Made functional with Foundry 0.7.x series

## [0.0.9]
- Added Korean language support, courtesy of drdwing
  
## [0.0.8]
- Added ConditionalVisibility.setCondition, hide, and unhide methods for macros and scripts to use
- Added an auto-hide off of stealth rolls in 5e.  (BetterRolls5e not supported - see README)

## [0.0.7]
- Add initial support for Pathfinder 2e, using the system stock Invisible token

## [0.0.6]
- Support other systems with default three conditions, with hide 5e only
- Systems that use their own statusEffects (e.g. pf2e) not supported
  
## [0.0.5]
- Move releases to artifact areas

## [0.0.3]
- Updated Hidden to not require javascript prompt

## [0.0.2]
- Added Hidden, with an automatic stealth roll checked against passive perception

## [0.0.1]
- Initial commit with Invisible, Obscured, and Devil's Sight

## [Known Issues]
- Auto-hiding on stealth does not work with BetterRolls5e
