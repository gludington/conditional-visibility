# API

**This old API is been removed**

~~New to version 0.0.8, script entry points are created for macro and script authors.  The following methods are supported:~~

~~`ConditionalVisibility.help()`~~
~~(GM only) pops up a dialog showing the current system, available conditions, and configuration status.~~

~~`ConditionalVisibility.setCondition(tokens, condition, value)`~~
~~* tokens - an array of tokens to affect~~
~~* condition - the name of the condition, e.g. invisible or indarkness.  You can check the available names for your system in the `help()` dialog.~~
~~* value true to turn the condition on, false to turn it off~~

~~For example, if you want to set all the selected tokens invisible:~~
~~`ConditionalVisibility.setCondition(canvas.tokens.controlled, 'invisible', true)`~~

~~`ConditionalVisibility.hide(tokens, value)`~~
~~* tokens - a list of tokens to affect~~
~~* value - optional; a flat value to apply to all tokens.  If not specified, each token will make system-specific roll.~~
~~The *hidden* condition requires system specific rules, and so uses a different set of methods.  Note this is only available on systems that have these rules developed, currently only D&D 5e.  Issues or contributions for other issues are welcome.~~

~~`ConditionalVisibility.unHide(tokens)`~~
~~* tokens - a list of tokens from which to remove the hidden condition.~~

Many function of this api are redundant they can be easily replaced with other macros or modules, is advisable to use other module like [CUB](https://github.com/death-save/combat-utility-belt) or [Dfred convenient effects](https://github.com/DFreds/dfreds-convenient-effects/) for manage the active effects anyway this module cna mange the active effects too.

## Setting members

<dl>
<dt><a href="#SENSES">SENSES</a> ⇒ <code>array</code></dt>
<dd><p>The senses used in this system</p></dd>
<dt><a href="#CONDTIONS">CONDITIONS</a> ⇒ <code>array</code></dt>
<dd><p>The conditions used in this system</p></dd>
</dl>

Work in progress...

## Setting Functions

Work in progress...

## Conditional Visibility Functions

~~### ConditionalVisibility.setCondition(tokenNameOrId: string, effectId: string, distance: number) ⇒ <code>Promise.&lt;void&gt;</code>~~

**NOTE: This is deprecated use instead `ConditionalVisibility.API.setCondition(tokenNameOrId: string, effectId: string, distance: number) ⇒ <code>Promise<void></code>`**

Add a active effect for work with the module, the `effectId` parameter must be present on the [table](./tables.md) associated to the system.

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| tokenNameOrId | <code>string</code> | The name or the id of the token | <code>undefined</code> |
| effectNameOrId | <code>string</code> | The effect name or id used from this module, must be present on the [table](./tables.md) of this system  | <code>undefined</code> |
| disabled | <code>boolean</code> | The effect must be applied, but disabled | <code>false</code> |
| distance | <code>number</code> | OPTIONAL: explicit distance in units not grid to add to the Active Effects | <code>0</code> |
| visionLevelValue | <code>number</code> | OPTIONAL: explicit distance in units not grid to add to the Active Effects | <code>0</code> |


**Example**:
`ConditionalVisibility.setCondition('Zruggig Widebrain','darkvision', false, 60, 4)`

`game.conditional-visibility.setCondition('Zruggig Widebrain','darkvision' false, 60, 4)`

`ConditionalVisibility.setCondition('Zruggig Widebrain','darkvision', false)`

`game.conditional-visibility.setCondition('Zruggig Widebrain','darkvision' false)`

`ConditionalVisibility.setCondition('Zruggig Widebrain','darkvision', false, 0, 4)`

`game.conditional-visibility.setCondition('Zruggig Widebrain','darkvision' false, 0, 4)`


### ConditionalVisibility.API.setCondition(tokenNameOrId: string, effectId: string, distance: number) ⇒ <code>Promise.&lt;void&gt;</code>

Add a active effect for work with the module, the `effectId` parameter must be present on the [table](./tables.md) associated to the system.

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| tokenNameOrId | <code>string</code> | The name or the id of the token | <code>undefined</code> |
| effectNameOrId | <code>string</code> | The effect name or id used from this module, must be present on the [table](./tables.md) of this system  | <code>undefined</code> |
| disabled | <code>boolean</code> | The effect must be applied, but disabled | <code>false</code> |
| distance | <code>number</code> | OPTIONAL: explicit distance in units not grid to add to the Active Effects | <code>0</code> |
| visionLevelValue | <code>number</code> | OPTIONAL: explicit distance in units not grid to add to the Active Effects | <code>0</code> |

**Example**:
`ConditionalVisibility.API.setCondition('Zruggig Widebrain','darkvision', false, 60, 4)`

`game.conditional-visibility.API.setCondition('Zruggig Widebrain','darkvision' false, 60, 4)`

`ConditionalVisibility.API.setCondition('Zruggig Widebrain','darkvision', false,)`

`game.conditional-visibility.API.setCondition('Zruggig Widebrain','darkvision' false)`

### ConditionalVisibility.API.addEffectConditionalVisibilityOnToken(tokenNameOrId: string, effectId: string, distance: number) ⇒ <code>Promise.&lt;void&gt;</code>

**NOTE:** is the same of the _ConditionalVisibility.API.setCondition_

Add a active effect for work with the module, the `effectId` parameter must be present on the [table](./tables.md) associated to the system.

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| tokenNameOrId | <code>string</code> | The name or the id of the token | <code>undefined</code> |
| effectNameOrId | <code>string</code> | The effect name or id used from this module, must be present on the [table](./tables.md) of this system  | <code>undefined</code> |
| disabled | <code>boolean</code> | The effect must be applied, but disabled | <code>false</code> |
| distance | <code>number</code> | OPTIONAL: explicit distance in units not grid to add to the Active Effects | <code>0</code> |
| visionLevelValue | <code>number</code> | OPTIONAL: explicit distance in units not grid to add to the Active Effects | <code>0</code> |

**Example**:
`ConditionalVisibility.API.addEffectConditionalVisibilityOnToken('Zruggig Widebrain','darkvision', false, 60, 4)`

`game.conditional-visibility.API.addEffectConditionalVisibilityOnToken('Zruggig Widebrain','darkvision' false, 60, 4)`

`ConditionalVisibility.API.addEffectConditionalVisibilityOnToken('Zruggig Widebrain','darkvision', false,)`

`game.conditional-visibility.API.addEffectConditionalVisibilityOnToken('Zruggig Widebrain','darkvision' false)`


### ConditionalVisibility.API.addEffectOnToken(tokenNameOrId: string, effectName: string, effect: Effect) ⇒ <code>Promise.&lt;void&gt;</code>

Add a active effect for work with the module, the `effectId` parameter must be present on the [table](./tables.md) associated to the system.

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| tokenNameOrId | <code>string</code> | The name or the id of the token | <code>undefined</code> |
| effectName | <code>string</code> | The effectId used from this module, must be present on the [table](./tables.md) of this system | <code>undefined</code> |
| effect | <code>Effect</code> | The effect object from the [Dfred convenient effects](https://github.com/DFreds/dfreds-convenient-effects/) | <code>undefined</code> |

**Example**:
`ConditionalVisibility.API.addEffectOnToken('Zruggig Widebrain','darkvision',60)`

`game.conditional-visibility.API.addEffectOnToken('Zruggig Widebrain','darkvision',60)`


### ConditionalVisibility.API.getAllSensesAndConditions() ⇒ <code>Promise.&lt;SenseData[]&gt;</code>

Return all senses and conditions register form the module by default hte ones present on the [table](./tables.md) associated to the system.

**Returns**: <code>Promise.&lt;SenseData[]&gt;</code> - A array of SenseData promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |

**Example**:
`ConditionalVisibility.API.getAllSensesAndConditions()`

`game.conditional-visibility.API.getAllSensesAndConditions()`


### ConditionalVisibility.API.registerSense(senseData: SenseData) ⇒ <code>Promise.&lt;void&gt;</code>

A method to register a customize sense to add to the world

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| senseData | <code>SenseData</code> | The sense data object | <code>undefined</code> |


**Example**:
```
ConditionalVisibility.API.registerSense({
  id: 'bloodsight',
  name: 'Bloodsight',
  path: '',
  img: 'systems/dnd5e/icons/spells/haste-fire-3.jpg',
  visionLevelMinIndex: 0,
  visionLevelMaxIndex: 5,
  conditionElevation: true,
  conditionTargets: ['invisible','hidden'],
  conditionSources: [],
  effectCustomId: '',
})
```

```
game.conditional-visibility.API.registerSense({
  id: 'bloodsight',
  name: 'Bloodsight',
  path: '',
  img: 'systems/dnd5e/icons/spells/haste-fire-3.jpg',
  visionLevelMinIndex: 0,
  visionLevelMaxIndex: 5,
  conditionElevation: true,
  conditionTargets: ['invisible','hidden'],
  conditionSources: [],
  effectCustomId: '',
})
```

### ConditionalVisibility.API.registerCondition(senseData: SenseData) ⇒ <code>Promise.&lt;void&gt;</code>

A method to register a customize condition to add to the world. **Remember for make this work you need to add the active effect with the same name with the custom handler from [Dfred convenient effects](https://github.com/DFreds/dfreds-convenient-effects/) is a forced thing i know, but that a module alreay have all the import/export and ui stuff... if no active effect is founded a deafult one is build with minimal data**

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| senseData | <code>SenseData</code> | The sense data object | <code>undefined</code> |

```
ConditionalVisibility.API.registerCondition({
  id: 'bloodsight',
  name: 'Bloodsight',
  path: '',
  img: 'systems/dnd5e/icons/spells/haste-fire-3.jpg',
  visionLevelMinIndex: 0,
  visionLevelMaxIndex: 5,
  conditionElevation: true,
  conditionTargets: [],
  conditionSources: ['darkvision'],
  effectCustomId: '',
})
```

```
game.conditional-visibility.API.registerCondition({
  id: 'bloodsight',
  name: 'Bloodsight',
  path: '',
  img: 'systems/dnd5e/icons/spells/haste-fire-3.jpg',
  visionLevelMinIndex: 0,
  visionLevelMaxIndex: 5,
  conditionElevation: true,
  conditionTargets: [],
  conditionSources: ['darkvision'],
  effectCustomId: '',
})
```

### ConditionalVisibility.API.unRegisterSense(senseDataIdOrName: string) ⇒ <code>Promise.&lt;void&gt;</code>

A method to un-register a customize sense from the world.

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| senseDataIdOrName | <code>string</code> | The sense id or name to remove (if founded) | <code>undefined</code> |


**Example**:

`ConditionalVisibility.API.unRegisterSense('bloodsight')`

`game.conditional-visibility.API.unRegisterSense('bloodsight')`

### ConditionalVisibility.API.unRegisterCondition(senseDataIdOrName: string) ⇒ <code>Promise.&lt;void&gt;</code>

A method to un-register a customize condition from the world

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| senseDataIdOrName | <code>string</code> | The condition id or name to remove (if founded) | <code>undefined</code> |


**Example**:

`ConditionalVisibility.API.unRegisterCondition('bloodsight')`

`game.conditional-visibility.API.unRegisterCondition('bloodsight')`

## Work in progress for add the others function, not sure if i'll find the time for this, but you can read directly the API class if you want [API](../src/module/api.ts)...

# Models

## Sense Data

This is the model used for register a custom sense or condition to the module

```
{
  id: string; // This is the unique id used for sync all the senses and conditions (please no strange character, no whitespace and all in lowercase...)
  name: string; // This is the unique name used for sync all the senses and conditions (here you cna put any dirty character you want)
  path: string; // This is the path to the property you want to associate with this sense e.g. data.skills.prc.passive
  img: string; // [OPTIONAL] Image to associate to this sense
  visionLevelMinIndex: number; // [OPTIONAL] check a min index for filter a range of sense can see these conditions, or viceversa conditions can be seen only from this sense
  visionLevelMaxIndex: number; // [OPTIONAL] check a max index for filter a range of sense can see these conditions, or viceversa conditions can be seen only from this sense
  conditionElevation: boolean; // [OPTIONAL] force to check the elevation between the source token and the target token, useful when using module like 'Levels'
  conditionTargets: string[]; // [OPTIONAL] force to apply the check only for these sources (you can set this but is used only from sense)
  conditionSources: string[]; // [OPTIONAL] force to apply the check only for these sources (you can set this but is used only from condition)
  effectCustomId: string; // [OPTIONAL] if you use the module 'DFreds Convenient Effects', you can associate a custom active effect by using the customId string of the DFred effect
  conditionTargetImage: string; // [OPTIONAL] string path to the image applied on target token and used from the source token (the one you click on) for replace only for that player with a special sight
  conditionDistance: number; // [OPTIONAL] set a maximum distance for check the sight with this effect
}
```

## Effect

The effect object inspired from the [Dfred convenient effects](https://github.com/DFreds/dfreds-convenient-effects/)
This is a example

```
{
    customId: string;
    name: string;
    description: string;
    icon: string;
    tint: string;
    seconds: number;
    rounds: number;
    turns: number;
    flags: {};
    changes: {};
    atlChanges: {};
    tokenMagicChanges: {};
    atcvChanges: {}; // THESE ARE THE NEW CONDITIONAL VISIBILITY CHANGES
}
```
