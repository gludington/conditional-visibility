![https://img.shields.io/badge/Foundry%20VTT-0.6.6%2B-green](https://img.shields.io/badge/Foundry%20VTT-0.6.6%2B-green)

# conditional-visibility
**Author**: Greg Ludington  

[Installation](#Installation)

[Module Manifest](https://raw.githubusercontent.com/death-save/maestro/master/module.json)

[Changelog](https://github.com/death-save/maestro/blob/master/CHANGELOG.md)


Hide some things from some players, but not others!

## Usage

### Conditions
**Conditional Visibility** works by adding new conditions to the conditions panel, for Invisible, Obscured, In Magical Darkness, and Hidden (currently 5e Only)
![Conditions Panel](https://raw.githubusercontent.com/gludington/conditional-visibility/master/src/support/conditions.png)

### Invisible, Obscured, or Magical Darkness
When a token has one of these conditions, it can only be seen by a token with the proper senses configured in their Vision panel.

![Vision Panel](https://raw.githubusercontent.com/gludington/conditional-visibility/master/src/support/visionControls.png)

Put it together, it looks like this (click to play on YouTube):

[![Watch the video](https://img.youtube.com/vi/IlgjHmSAsww/hqdefault.jpg)](https://youtu.be/IlgjHmSAsww)

### Hidden
When hidden is selected, a stealth roll is automatically made, which can be customized.  The token will only be seen by a token whose passive perception
exceeds that stealth roll. (click to play on YouTube):
[![Watch the video](https://img.youtube.com/vi/pYay4fRlnu4/hqdefault.jpg)](https://youtu.be/pYay4fRlnu4)

And communicates to player screens (click to play on YouTube):

[![Watch the video](https://img.youtube.com/vi/U308ksxblZU/hqdefault.jpg)](https://youtu.be/U308ksxblZU)

## Installation

1. Navigate to the Foundry Setup screen and click on the Modules tab
2. Click Install Module and paste the module.json link into the box in the following link: https://raw.githubusercontent.com/gludington/conditional-visibility/master/src/module.json
3. Once the **conditional-visibility** module is installed, open your desired world and navigate to the `Game Settings` > `Configure Settings` > `Module Settings` and enable the module

## Issues/Feedback

You can create an issue here: [Issue Log](https://github.com/gludington/conditional-visibility/issues)

# Known Issues
* Not with Pathfinder2e or other systems that use their own condition systems

## Attributions
**Icons by**
* unknown.svg, newspaper.svg, and foggy.svg icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a>, from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
* moon.svg icon made by <a href="https://www.flaticon.com/authors/iconixar" title="iconixar">iconixar</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>