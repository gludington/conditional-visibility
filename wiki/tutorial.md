# Tutorial

## How the active effect name is checked on the module ?

You can use any active effect where the name is founded from the following code `isStringEquals` of the module:

```
export function isStringEquals(stringToCheck1: string, stringToCheck2: string, startsWith = true): boolean {
  if (stringToCheck1 && stringToCheck2) {
    const s1 = cleanUpString(stringToCheck1) ?? '';
    const s2 = cleanUpString(stringToCheck2) ?? '';
    if (startsWith) {
      return s1.startsWith(s2) || s2.startsWith(s1);
    } else {
      return s1 === s2;
    }
  } else {
    return stringToCheck1 === stringToCheck2;
  }
}

export function cleanUpString(stringToCleanUp: string) {
  // regex expression to match all non-alphanumeric characters in string
  const regex = /[^A-Za-z0-9]/g;
  if (stringToCleanUp) {
    return i18n(stringToCleanUp).replace(regex, '').toLowerCase();
  } else {
    return stringToCleanUp;
  }
}
```

## How the conditional visibility check is calculated on the module ?

The calculation for the vision checks is in three points (these check are enabled for all system):

1) ~~Check if source token has the vision enabled, if disabled is like the module is not active for that token.~~ 
2) Check if the target is owned from the player if true you can see the token.
3) Check for the token disposition:
  3.1) by default the check is applied to all token disposition Friendly, Neutral, Hostile, You can disable the check for all non hostile NPC with the module settings 'Disable for non hostile npc'
  3.2) A npc Hostile can see other Hostile npc
4) If module setting `autoPassivePerception` is enabled, check by default if _Perception Passive of the system_ is `>` of the _Stealth Passive of the System_, but only IF NO ACTIVE EFFECT CONDITION ARE PRESENT ON THE TARGET
5) Check if the source token has at least a active effect marked with key `ATCV.<sense or condition id>` 
  5.1) If at least a condition is present on target it should be false else with no 'sense' on source e no ' condition' on target is true
6) Check if the source token has the active effect `blinded` active, if is true, you cannot see anything and return false.
7) If not 'condition' are present on the target token return true (nothing to check).
8) Check again for _passive perception vs passive stealth_ like on point 4) this time we use the hidden active effect like the stealth passive on the target token...THIS WILL BE CHECK ONLY IF ONE CONDITION IS PRESENT ON THE TARGET AND THE CONDITION TYPE IS 'HIDDEN'
9) Check if the source token has some 'sense' powerful enough to beat every 'condition' ont he target token:
  9.0) If no `ATCV.visioId` is founded return true (this shoudldn't never happened is just for avoid some unwanted behaviour)
  9.1) Check for explicit `ATCV.conditionTargets` and `ATCV.conditionSources`, this control make avoid the following 9.X check
  9.2) If the 'condition' on the target token is `NONE` return true
  9.3) If the 'condition' on the target token is `HIDDEN` and the _Perception Passive of the system_ of the source token is `>` of the current sense value, we use the  _Perception Passive of the system_ for the checking and return ture if is `>` of the condition value setted.
  9.4)  The range of 'condition' level [`conditionLevelMinIndex,conditionLevelMaxIndex`], must be between the 'sense' range level [`conditionLevelMinIndex,conditionLevelMaxIndex`] like explained on the [tables](./tables.md).
10) Check if `ATCV.conditionElevation` is != 0, will check if the source token and target token are at the same level.
11)  Check if `ATCV.conditionDistance` is valorized if is set to a numeric value, will check if the tokens are near enough to remain hidden (remember -1 is infinity distance).
12) Check if the vision level value of the filtered  'sense' on the source token is a number `>=` of the vision level value of the filtered 'condition' on the target token, if the sense is set to `-1` this check is automatically skipped. If the condition and the sesne are both set with value `-1` the condition won.

## What active effect data changes are used from this module ?

Every active effect data of this is module use any chnages with the prefix `ATCV` acronim for _Active Token Conditional Visibility_ .

**NOTE:** by default all _senses_ are passive AE and all _conditions_ are _temporary_ AE
**NOTE:** for now every active effect can have only one `ATCV.<sense or condition id>`,`ATCV.conditionElevation`,`ATCV.conditionTargets`,`ATCV.conditionSources` key at the time, if multiple are setted we get only the first for the checking

There three type of these AE used and supported from this module:

| Key Syntax                      | Type    | Description                         | Examples Active Effect Data [Key = value] |
| :------------------------------:|:-------:|:-----------------------------------:|:--------:|
| `ATCV.<sense or condition id>`  | number  | Identify the "vision level" of the sense/condition | `ATCV.invisible = 12`, `ATCV.darkvision = 13` |
| `ATCV.conditionElevation`       | boolean | if true will force to check the elevation between tokens source and target, VERY USEFUL IF YOU USE LEVELS | `ATCV.conditionElevation = true` |
| `ATCV.conditionTargets`         | list of string | This is used for explicitly tell to the checker what AE can be see from this AE based on the custom id used from this module, check out the [TABLES](./tables.md) for details, **this is basically a override of the point 6. checker based on the indexes given to the sense  |  `ATCV.conditionTargets=hidden,invisible` |
| `ATCV.conditionSources`         | list of string | This is used for explicitly tell to the checker what AE can be see from this AE based on the custom id used from this module, check out the [TABLES](./tables.md) for details, **this is basically a override of the point 6. checker based on the indexes given to the condition  |  `ATCV.conditionSources=darkvision,tremorsense` |
| `ATCV.conditionDistance`  | number | set a maximum distance for check the sight with this effect | `ATCV.conditionDistance = 12` |
| `ATCV.conditionType`  | string | indicate the type of CV usually they are or 'sense' or 'condition' not both, **THIS IS ESSENTIAL FOR USE SENSE AND CONDITION NOT REGISTERED ON THE MODULE IF NOT FOUNDED BY DEFAULT IS CONSIDERED A SENSE**, so now you can just modify the AE and you are not forced to call the registered macro of the module CV, this is very useful for integration with other modules. | ``ATCV.conditionType = sense, ATCV.conditionType = condition` |
| `ATCV.conditionLevelMinIndex`  | number | set the lower level index for setup the range between sense and condtion, **you need this only for very strange use case.. but you can do everything now** | `ATCV.conditionLevelMinIndex = 1` |
| `ATCV.conditionLevelMaxIndex`  | number | set the upper level index for setup the range between sense and condtion, **you need this only for very strange use case.. but you can do everything now** | `ATCV.conditionLevelMaxIndex = 10` |




[WORKING IN PROGRESS]

| Key Syntax                      | Type    | Description                         | Examples Active Effect Data [Key = value] |
| :------------------------------:|:-------:|:-----------------------------------:|:--------:|
| `ATCV.conditionTargetImage`     | string  | string path to the image applied on target token and used from the source token (the one you click on) for replace only for that player with a special sight |

## Can i add my custom sense or condition on it ?

You can add a custom sense or condition by using these code (it' the same of the module [DFreds Convenient Effects](https://github.com/DFreds/dfreds-convenient-effects))

### Option 1 : You can register the sense or the condition with the apposite API

```  
ConditionalVisibility.API.registerSense({
    id: string;     // This is the unique id used for sync all the senses and conditions (please no strange character, no whitespace and all in lowercase...)
    name: string;   // This is the unique name used for sync all the senses and conditions (here you cna put any dirty character you want)
    path: string;   // This is the path to the property you want to associate with this sense e.g. data.skills.prc.passive
    img: string;    // [OPTIONAL] Image to associate to this sense
    conditionLevelMinIndex: number; // [OPTIONAL] check a min index for filter a range of sense can see these conditions, or viceversa conditions can be seen only from this sense
    conditionLevelMaxIndex: number; // [OPTIONAL] check a max index for filter a range of sense can see these conditions, or viceversa conditions can be seen only from this sense
    conditionElevation: boolean; // [OPTIONAL] force to check the elevation between the source token and the target token, useful when using module like 'Levels'
    conditionTargets:string[]; // [OPTIONAL] force to apply the check only for these sources (you can set this but is used only from sense active effect)
    conditionSources:string[]; // [OPTIONAL] force to apply the check only for these sources (you can set this but is used only from condition active effect)
    conditionTargetImage: string; // [OPTIONAL] string path to the image applied on target token and used from the source token (the one you click on) for replace only for that player with a special sight
    conditionDistance: number; // [OPTIONAL] set a maximum distance for check the sight with this effect
});
```

```  
ConditionalVisibility.API.registerCondition({
    id: string;     // This is the unique id used for sync all the senses and conditions (please no strange character, no whitespace and all in lowercase...)
    name: string;   // This is the unique name used for sync all the senses and conditions (here you cna put any dirty character you want)
    path: string;   // This is the path to the property you want to associate with this sense e.g. data.skills.prc.passive
    img: string;    // [OPTIONAL] Image to associate to this sense
    conditionLevelMinIndex: number; // [OPTIONAL] check a min index for filter a range of sense can see these conditions, or viceversa conditions can be seen only from this sense
    conditionLevelMaxIndex: number; // [OPTIONAL] check a max index for filter a range of sense can see these conditions, or viceversa conditions can be seen only from this sense
    conditionElevation: boolean; // [OPTIONAL] force to check the elevation between the source token and the target token, useful when using module like 'Levels'
    conditionTargets:string[]; // [OPTIONAL] force to apply the check only for these sources (you can set this but is used only from sense active effect)
    conditionSources:string[]; // [OPTIONAL] force to apply the check only for these sources (you can set this but is used only from condition active effect)
    conditionTargetImage: string; // [OPTIONAL] string path to the image applied on target token and used from the source token (the one you click on) for replace only for that player with a special sight
    conditionDistance: number; // [OPTIONAL] set a maximum distance for check the sight with this effect
});
```

checkout more details on the [API](./api.md) documentation.

### Option 2: Simply create a new active effect wihtout use the register method

Just create a active effect with these two minimal change

| Key Syntax                      | Type    | Description                         | Examples Active Effect Data [Key = value] |
| :------------------------------:|:-------:|:-----------------------------------:|:--------:|
| `ATCV.<sense or condition id>`  | number  | Identify the "vision level" of the sense/condition | `ATCV.invisible = 12`, `ATCV.darkvision = 13` |
| `ATCV.conditionType`  | string | indicate the type of CV usually they are or 'sense' or 'condition' not both, **THIS IS ESSENTIAL FOR USE SENSE AND CONDITION NOT REGISTERED ON THE MODULE IF NOT FOUNDED BY DEFAULT IS CONSIDERED A SENSE**, so now you can just modify the AE and you are not forced to call the registered macro of the module CV, this is very useful for integration with other modules. | ``ATCV.conditionType = sense, ATCV.conditionType = condition` |
