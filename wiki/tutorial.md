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

1) Check if source token has the vision enabled, if disabled is like the module is not active for that token.
2) Check if the target is owned from the player if true you can see the token.
3) Check for the token disposition:
   1) You can disable the check for all non hostile NPC with the module settings 'Disable for non hostile npc'
   2) by default the check is applied to all token disposition Friendly, Neutral, Hostile
   3) A npc Hostile can see other Hostile npc (check out the AE from known the state of this)
4) Check if the source token has at least a active effect marked with key `ATCV.<sense or condition id>` 
5) Check if the source token has the active effect `blinded` active, if is true, you cannot see anything.
6) Check if the source token has at least a index value between the index of some active effect of the conditions, this will check the elevation too if the active effect key `ATCV.conditionElevation` is set to true, check out the [TABLES](./tables.md) for details, you can skip this check by using the AE key `ATCV.conditionTargets` explained below.
7) Check if the vision level value of the sense is a number > = of the vision level value of the condition, if the sense is set to `-1` this check is automatically skipped. If the condition and the sesne are both set with value `-1` the condition won.

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




[WORKING IN PROGRESS]

| Key Syntax                      | Type    | Description                         | Examples Active Effect Data [Key = value] |
| :------------------------------:|:-------:|:-----------------------------------:|:--------:|
| `ATCV.conditionTargetImage`     | string  | string path to the image applied on target token and used from the source token (the one you click on) for replace only for that player with a special sight |

## Can i add my custom sense or condition on it ?

You can add a custom sense or condition by using these code (it' the same of the module [DFreds Convenient Effects](https://github.com/DFreds/dfreds-convenient-effects))

```  
ConditionalVisibility.API.registerSense({
    id: string;     // This is the unique id used for sync all the senses and conditions (please no strange character, no whitespace and all in lowercase...)
    name: string;   // This is the unique name used for sync all the senses and conditions (here you cna put any dirty character you want)
    path: string;   // This is the path to the property you want to associate with this sense e.g. data.skills.prc.passive
    img: string;    // [OPTIONAL] Image to associate to this sense
    visionLevelMinIndex: number; // [OPTIONAL] check a min index for filter a range of sense can see these conditions, or viceversa conditions can be seen only from this sense
    visionLevelMaxIndex: number; // [OPTIONAL] check a max index for filter a range of sense can see these conditions, or viceversa conditions can be seen only from this sense
    conditionElevation: boolean; // [OPTIONAL] force to check the elevation between the source token and the target token, useful when using module like 'Levels'
    conditionTargets:string[]; // [OPTIONAL] force to apply the check only for these sources (you can set this but is used only from sense active effect)
    conditionSources:string[]; // [OPTIONAL] force to apply the check only for these sources (you can set this but is used only from condition active effect)
    conditionTargetImage: string; // [OPTIONAL] string path to the image applied on target token and used from the source token (the one you click on) for replace only for that player with a special sight
    conditionDistance: number; // [OPTIONAL] set a maximum distance for check the sight with this effect
});
```

checkout more details on the [API](./api.md) documentation.
