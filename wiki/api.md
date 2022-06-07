# API

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

### game.modules.get('conditional-visibility').api.setCondition(tokenNameOrId: string, effectId: string, distance: number) ⇒ <code>Promise.&lt;void&gt;</code>

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
`game.modules.get('conditional-visibility').api.setCondition('Zruggig Widebrain','darkvision', false, 60, 4)`

`game.modules.get('conditional-visibility').api.setCondition('Zruggig Widebrain','darkvision' false, 60, 4)`

`game.modules.get('conditional-visibility').api.setCondition('Zruggig Widebrain','darkvision', false,)`

`game.modules.get('conditional-visibility').api.setCondition('Zruggig Widebrain','darkvision' false)`

### game.modules.get('conditional-visibility').api.addEffectConditionalVisibilityOnToken(tokenNameOrId: string, effectId: string, distance: number) ⇒ <code>Promise.&lt;void&gt;</code>

**NOTE:** is the same of the _game.modules.get('conditional-visibility').api.setCondition_

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
`game.modules.get('conditional-visibility').api.addEffectConditionalVisibilityOnToken('Zruggig Widebrain','darkvision', false, 60, 4)`

`game.modules.get('conditional-visibility').api.addEffectConditionalVisibilityOnToken('Zruggig Widebrain','darkvision' false, 60, 4)`

`game.modules.get('conditional-visibility').api.addEffectConditionalVisibilityOnToken('Zruggig Widebrain','darkvision', false,)`

`game.modules.get('conditional-visibility').api.addEffectConditionalVisibilityOnToken('Zruggig Widebrain','darkvision' false)`


### game.modules.get('conditional-visibility').api.getAllDefaultSensesAndConditions(token:Token) ⇒ <code>Promise.&lt;SenseData[]&gt;</code>

Return all senses and conditions register form the module by default hte ones present on the [table](./tables.md) associated to the system.

**Returns**: <code>Promise.&lt;SenseData[]&gt;</code> - A array of SenseData promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| token | <code>Token</code> | The token object | <code>undefined</code> |

**Example**:
`game.modules.get('conditional-visibility').api.getAllDefaultSensesAndConditions()`

`game.modules.get('conditional-visibility').api.getAllDefaultSensesAndConditions()`


### game.modules.get('conditional-visibility').api.registerSense(senseData: SenseData) ⇒ <code>Promise.&lt;void&gt;</code>

A method to register a customize sense to add to the world

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| senseData | <code>SenseData</code> | The sense data object | <code>undefined</code> |


**Example**:
```
game.modules.get('conditional-visibility').api.registerSense({
  id: 'bloodsight',
  name: 'Bloodsight',
  path: '',
  img: 'systems/dnd5e/icons/spells/haste-fire-3.jpg',
  conditionElevation: true,
  conditionTargets: ['invisible','hidden'],
  conditionSources: [],
})
```

```
game.modules.get('conditional-visibility').api.registerSense({
  id: 'bloodsight',
  name: 'Bloodsight',
  path: '',
  img: 'systems/dnd5e/icons/spells/haste-fire-3.jpg',
  conditionElevation: true,
  conditionTargets: ['invisible','hidden'],
  conditionSources: [],
})
```

### game.modules.get('conditional-visibility').api.registerCondition(senseData: SenseData) ⇒ <code>Promise.&lt;void&gt;</code>

A method to register a customize condition to add to the world. **Remember for make this work you need to add the active effect with the same name with the custom handler from [Dfred convenient effects](https://github.com/DFreds/dfreds-convenient-effects/) is a forced thing i know, but that a module alreay have all the import/export and ui stuff... if no active effect is founded a deafult one is build with minimal data**

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| senseData | <code>SenseData</code> | The sense data object | <code>undefined</code> |

```
game.modules.get('conditional-visibility').api.registerCondition({
  id: 'bloodsight',
  name: 'Bloodsight',
  path: '',
  img: 'systems/dnd5e/icons/spells/haste-fire-3.jpg',
  conditionElevation: true,
  conditionTargets: [],
  conditionSources: ['darkvision'],
})
```

```
game.modules.get('conditional-visibility').api.registerCondition({
  id: 'bloodsight',
  name: 'Bloodsight',
  path: '',
  img: 'systems/dnd5e/icons/spells/haste-fire-3.jpg',
  conditionElevation: true,
  conditionTargets: [],
  conditionSources: ['darkvision'],
})
```

### game.modules.get('conditional-visibility').api.unRegisterSense(senseDataIdOrName: string) ⇒ <code>Promise.&lt;void&gt;</code>

A method to un-register a customize sense from the world.

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| senseDataIdOrName | <code>string</code> | The sense id or name to remove (if founded) | <code>undefined</code> |


**Example**:

`game.modules.get('conditional-visibility').api.unRegisterSense('bloodsight')`

`game.modules.get('conditional-visibility').api.unRegisterSense('bloodsight')`

### game.modules.get('conditional-visibility').api.unRegisterCondition(senseDataIdOrName: string) ⇒ <code>Promise.&lt;void&gt;</code>

A method to un-register a customize condition from the world

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| senseDataIdOrName | <code>string</code> | The condition id or name to remove (if founded) | <code>undefined</code> |


**Example**:

`game.modules.get('conditional-visibility').api.unRegisterCondition('bloodsight')`

`game.modules.get('conditional-visibility').api.unRegisterCondition('bloodsight')`


### async game.modules.get('conditional-visibility').api.unHide(tokens: Token[]) ⇒  <code>Promise.&lt;void&gt;</code>

A method to force a array of tokens to be  visible to everyone with a specific flag "Force to be visible". This flag can be managed on the token configuration panel of every token.

**Returns**: <code>Promise.&lt;void&gt;</code> - A empty promise

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| tokens | <code>Token[]</code> | The array of tokens to make visible to everyone | <code>undefined</code> |


### async game.modules.get('conditional-visibility').api.forceToBeVisible(token: Token) ⇒  <code>Promise.&lt;void&gt;</code>

A method to force a token to be visibile for the CV checker

**Returns**: <code>Promise.&lt;void&gt;</code>

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| token | <code>string</code> | The token to show | <code>undefined</code> |

### async game.modules.get('conditional-visibility').api.unforceToBeVisible(token:Token) ⇒  <code>Promise.&lt;void&gt;</code>

A method to unforce a token to be visibile for the CV checker, the cheker will work on effects anyway.

**Returns**: <code>Promise.&lt;void&gt;</code>

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| token | <code>string</code> | The token to hide | <code>undefined</code> |

### game.modules.get('conditional-visibility').api.hasConditionFromId(tokenNameOrId:string, conditionId:string):boolean{

A method to check if a source token can has a specific condition

**Returns**: <code>boolean</code>

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| tokenNameOrId | <code>string</code> | The reference to the token | <code>undefined</code> |
| conditionId | <code>string</code> | The id of the condition | <code>undefined</code> |

### game.modules.get('conditional-visibility').api.hasCondition(token:Token, conditionId:string):boolean ⇒ <code>boolean</code>

A method to check if a source token can has a specific condition

**Returns**: <code>boolean</code>

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| token | <code>string</code> | The source token | <code>undefined</code> |
| conditionId | <code>string</code> | The id of the condition | <code>undefined</code> |

### game.modules.get('conditional-visibility').api.canSee(sourceToken: Token, targetToken: Token) ⇒ <code>boolean</code>

A method to check if a source token can see a target token

**Returns**: <code>boolean</code>

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| sourceToken | <code>string</code> | The source token | <code>undefined</code> |
| targetToken | <code>string</code> | The target token | <code>undefined</code> |

### game.modules.get('conditional-visibility').api.canSeeFromTokenIds(sourceTokenIdOrName: string, targetTokenIdOrName: string) ⇒ <code>boolean</code>

A method to check if a source token can see a target token

**Returns**: <code>boolean</code>

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| sourceTokenIdOrName | <code>string</code> | The source token id or name (if founded) | <code>undefined</code> |
| targetTokenIdOrName | <code>string</code> | The target token id or name (if founded) | <code>undefined</code> |

### game.modules.get('conditional-visibility').api.canSeeWithData(sourceTokenIdOrName: string, targetTokenIdOrName: string) ⇒ <code>CVResultData</code>

A method to check if a source token can see a target token, with info

**Returns**: <code>CVResultData</code>

| Param | Type | Description | Default |
| --- | --- | --- | --- |
| sourceTokenIdOrName | <code>string</code> | The source token id or name (if founded) | <code>undefined</code> |
| targetTokenIdOrName | <code>string</code> | The target token id or name (if founded) | <code>undefined</code> |

### async game.modules.get('conditional-visibility').api.cleanUpTokenSelected() ⇒ <code>Promise.&lt;void&gt;</code>

Macro to clean up flags on token and actor

**Examples**:

`game.modules.get('automated-polymorpher').api.cleanUpTokenSelected()`

### async game.modules.get('conditional-visibility').api.cleanUpToken(tokenId: string) ⇒ <code>Promise.&lt;void&gt;</code>

Macro to clean up flags on token and actor for specific

**Examples**:

`game.modules.get('automated-polymorpher').api.cleanUpToken('asedtd')`


###  [DEPRECATED] async game.modules.get('conditional-visibility').api.cleanUpTokenSelectedOnlyCVData() ⇒ <code>Promise.&lt;void&gt;</code>

Macro to clean up flags on token and actor, but limited only to CVDATA

**Examples**:

`game.modules.get('automated-polymorpher').api.cleanUpTokenSelectedOnlyCVData()`


## Work in progress for add the others function, not sure if i'll find the time for this, but you can read directly the API class if you want [API](../src/module/api.ts)...

# Models

## Sense Data

This is the model used for register a custom sense or condition to the module

```
{
  id: string; // This is the unique id used for sync all the senses and conditions (please no strange character, no whitespace and all in lowercase...)
  name: string; // This is the unique name used for sync all the senses and conditions (here you cna put any dirty character you want)
  path: string; // [OPTIONAL] This is the path to the property you want to associate with this sense e.g. data.skills.prc.passive
  img: string; // [OPTIONAL] Image to associate to this sense
  conditionType:string // indicate the type of CV usually they are or 'sense' or 'condition' not both, **THIS IS ESSENTIAL  FOR USE SENSE AND CONDITION NOT REGISTERED ON THE MODULE IF NOT FOUNDED BY DEFAULT IS CONSIDERED A SENSE**, so now you can just modify the AE and you are not forced to call the registered macro of the module CV, this is very useful for integration with other modules.
  conditionElevation:boolean; // [OPTIONAL] if true will force to check the elevation between tokens source and target, VERY USEFUL IF YOU USE LEVELS
  conditionTargets: Array of string; // [OPTIONAL] This is used for explicitly tell to the checker what AE Condition can be see from this AE Sense based on the custom id used from this module (you can set this but is used only from a sense effect), check out the [TABLES](./tables.md) for details, **this is basically a override of the point 6. checker based on the indexes given to the sense
  conditionSources: Array of string: // [OPTIONAL] This is used for explicitly tell to the checker what AE Sense can be see from this AE Condition based on the custom id used from this module (you can set this but is used only from a condition effect), check out the [TABLES](./tables.md) for details, **this is basically a override of the point 6. checker based on the indexes given to the condition
  conditionDistance:number; // [OPTIONAL] set a maximum distance for check the sight/vision with this effect
  conditionBlinded:boolean; // [OPTIONAL] If true this effect / condition is applied on the token / actor it will be evaluated for the blinded check and only another effect with `ATCV.conditionBlindedOverride = true` will be able to avoid this check.
  conditionBlindedOverride:boolean; // [OPTIONAL] If true it indicates that this effect is able to work even with the "Blinded" condition applied to the token
  conditionTargetImage:string  // [OPTIONAL] string path to the image applied on target token and used from the source token (the one you click on) for replace the image token only for that player with a special sight, only if the CV check is true
  conditionSourceImage:string; // [OPTIONAL] string path to the image applied on target token and used from the target token (the one you try to see) for replace the image token only for that player with a special sight, only if the CV check is true
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

## Active Token Effect Conditiona Visibility  Model or ATCV

{
  visionId: string, // This is the unique id used for sync all the senses and conditions (please no strange character, no whitespace and all in lowercase...)
  visionName: string, // This is the unique name used for sync all the senses and conditions (here you cna put any dirty character you want)
  visionPath: string, // [OPTIONAL] This is the path to the property you want to associate with this sense e.g. data.skills.prc.passive
  visionIcon: string, // [OPTIONAL] Image to associate to this sense
  visionLevelValue:number // The numeric value of the sense/condition to check with others
  visionIsDisabled: boolean, // Boolean value for tell if the effect is disabled or not
  visionType:string, // indicate the type of CV usually they are or 'sense' or 'condition' not both, **THIS IS ESSENTIAL  FOR USE SENSE AND CONDITION NOT REGISTERED ON THE MODULE IF NOT FOUNDED BY DEFAULT IS CONSIDERED A SENSE**, so now you can just modify the AE and you are not forced to call the registered macro of the module CV, this is very useful for integration with other modules.
  visionElevation:boolean, // [OPTIONAL] if true will force to check the elevation between tokens source and target, VERY USEFUL IF YOU USE LEVELS
  visionTargets: Array of string, // [OPTIONAL] This is used for explicitly tell to the checker what AE Condition can be see from this AE Sense based on the custom id used from this module (you can set this but is used only from a sense effect), check out the [TABLES](./tables.md) for details, **this is basically a override of the point 6. checker based on the indexes given to the sense
  visionSources: Array of string, // [OPTIONAL] This is used for explicitly tell to the checker what AE Sense can be see from this AE Condition based on the custom id used from this module (you can set this but is used only from a condition effect), check out the [TABLES](./tables.md) for details, **this is basically a override of the point 6. checker based on the indexes given to the condition
  visionDistance:number, // [OPTIONAL] set a maximum distance for check the sight/vision with this effect
  visionBlinded:boolean, // [OPTIONAL] If true this effect / condition is applied on the token / actor it will be evaluated for the blinded check and only another effect with `ATCV.conditionBlindedOverride = true` will be able to avoid this check.
  visionBlindedOverride:boolean, // [OPTIONAL] If true it indicates that this effect is able to work even with the "Blinded" condition applied to the token
  visionTargetImage:string,  // [OPTIONAL] string path to the image applied on target token and used from the source token (the one you click on) for replace the image token only for that player with a special sight, only if the CV check is true
  visionSourceImage:string, // [OPTIONAL] string path to the image applied on target token and used from the target token (the one you try to see) for replace the image token only for that player with a special sight, only if the CV check is true
}

## CVResultData

{
  sourceTokenId:string;
  targetTokenId:string;
  sourceVisionsLevels: AtcvEffect[];
  targetVisionsLevels: AtcvEffect[];
  canSee: boolean;
}