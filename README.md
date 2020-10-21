![https://img.shields.io/badge/Foundry%20VTT-0.6.6%2B-green](https://img.shields.io/badge/Foundry%20VTT-0.6.6%2B-green)

# conditional-visibility
**Author**: Greg Ludington  

[Installation](#Installation)

[Module Manifest](https://github.com/gludington/conditional-visibility/releases/download/v0.0.9/module.json)

[Changelog](https://github.com/gludington/conditional-visibility/blob/master/CHANGELOG.md)

Invisible Stalkers should only be seen by players that have cast See Invisibility.  Stealthy Goblins should only be seen by players with high perception.
And when that Drow casts Darkness, players should need Devil's Sight to see any tokens inside.

Conditional Visibility allows you to set conditions on tokens that will display them only to players whose senses meet the conditions necessary to see
the token.

## Usage

### Conditions
**Conditional Visibility** works by adding new conditions to the conditions panel, for Invisible, Obscured, In Magical Darkness, and Hidden (currently 5e Only).
It does not work for game systems that use their own condition systems, though discussion (and pull requests!) are certainly welcomed
from those more familiar with those systems.  Pathfinder 2e has partial support now, using the system's default Invisible condition.

![Conditions Panel](https://raw.githubusercontent.com/gludington/conditional-visibility/master/src/support/conditions.png)

### Invisible, Obscured, or Magical Darkness
When a token has one of these conditions, it can only be seen by a token with the proper senses configured in their Vision panel.

![Vision Panel](https://raw.githubusercontent.com/gludington/conditional-visibility/master/src/support/visionControls.png)

Put it together, it looks like this (click to play on YouTube):

[![Watch the video](https://img.youtube.com/vi/IlgjHmSAsww/hqdefault.jpg)](https://youtu.be/IlgjHmSAsww)

### Hidden (currently 5e only)
When the hidden condition is selected, a stealth roll is automatically made, which can be customized before closing.  The token will only be seen by a token whose passive perception
exceeds that stealth roll. (click to play on YouTube):

[![Watch the video](https://img.youtube.com/vi/pYay4fRlnu4/hqdefault.jpg)](https://youtu.be/pYay4fRlnu4)

### Other Ways of Applying conditions to a token

#### Scripting

New to version 0.0.8, script entry points are created for macro and script authors.  The following methods are supported:

`ConditionalVisibility.help()`

(GM only) pops up a dialog showing the current system, available conditions, and configuration status.

`ConditionalVisibility.setCondition(tokens, condition, value)`

* tokens - an array of tokens to affect
* condition - the name of the condition, e.g. invisible or indarkness.  You can check the available names for your system in the `help()` dialog.
* value true to turn the condition on, false to turn it off

For example, if you want to set all the selected tokens invisible:
`ConditionalVisibility.setCondition(canvas.tokens.controlled, 'invisible', true)`

The *hidden* condition requires system specific rules, and so uses a different set of methods.  Note this is only available on systems that have these rules developed, currently only D&D 5e.  Issues or contributions for other issues are welcome.

`ConditionalVisibility.hide(tokens, value)`
* tokens - a list of tokens to affect
* value - optional; a flat value to apply to all tokens.  If not specified, each token will make system-specific roll.

`ConditionalVisibility.unHide(tokens)`
* tokens - a list of tokens from which to remove the hidden condition. 

#### Auto-applied from Stealth Rolls
Conditional Visibility contains an setting to auto-apply the hidden condition based on a stealth roll.  Currently only 5e; again, contributions for other systems are welcomed.

![Vision Panel](https://raw.githubusercontent.com/gludington/conditional-visibility/master/src/support/autoStealth.png)

When this setting is true, then rolling stealth from that token's character sheet will apply the hidden condition based on the value of that roll.

[![Watch the video](https://img.youtube.com/vi/U308ksxblZU/hqdefault.jpg)](https://youtu.be/U308ksxblZU)

## Installation

1. Navigate to the Foundry Setup screen and click on the Modules tab
2. Click Install Module and paste the module.json link from the latest release into the box.  (Currently, https://github.com/gludington/conditional-visibility/releases/download/v0.0.6/module.json )
3. Once the **conditional-visibility** module is installed, open your desired world and navigate to the `Game Settings` > `Configure Settings` > `Module Settings` and enable the module

## Note for Combat Utility Belt Users
If you use Combat Utility Belt and check "Remove Default Status Effects," it will remove those Status Effects necessary for this module to function.  They can be re-added using Combat Utility Belt's Condition Lab:

![Example: Adding Unknown](https://user-images.githubusercontent.com/87745/95407444-06d6a880-08eb-11eb-9478-6401fc1d02f8.png)

If each condition is added to the CUB set, Conditional Visibility will again function, even if CUB has removed the default set.  The pairs would be:

Invisible

* modules/conditional-visibility/icons/unknown.svg

Obscured

* modules/conditional-visibility/icons/foggy.svg

In Darkness

* modules/conditional-visibility/icons/moon.svg

Hidden (5e only)

* modules/conditional-visibility/icons/newspaper.svg

## Issues/Feedback

You can create an issue here: [Issue Log](https://github.com/gludington/conditional-visibility/issues)

# Known Issues
* Pathfinder 2e supports only the "Invisible" condition.
* Will not work if the hide regular conditions options of Combat Utility Belt is checked, as it hides the required Conditional Visibility conditions

## Attributions
**Icons by**
* unknown.svg, newspaper.svg, and foggy.svg icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a>, from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
* moon.svg icon made by <a href="https://www.flaticon.com/authors/iconixar" title="iconixar">iconixar</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>