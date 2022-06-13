## System Dnd5e Tables

These tables are essential because they help the community to decide how to calculate a hierarchy between the Active Effect

The checking is base on the active effect change `ATCV.condtionSources` and `ATCV.condtionTargets`

**A sense 'X' can see the condtion 'Y'

Check is the array of id condtions on the sense `ATCV.condtionTargets` contain the id condtion , or check is the array of id senses on the contion `ATCV.condtionSources` contain the id sense.

NOTE: If the checkbox is check, but no AE with name 'Stealthed' is applied on the actor uncheck and recheck this checkbox for refresh the actor.

NOTE: If the 'Hidden' condition is applied on this token the condition 'Stealthed' is ignored for the concept "active stealth" is used instead "passive stealth".


### Senses

| Image | Effect\Vision Level  | effectId used on the module | Check Elevation | Condition |
|:------|:---------------------|:---------------------------:|:---------------:|:---------:|
|<img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/ae/none.jpg" alt="" style="height: 50px; width:50px;"></img> | **None** | none | false | |
|<img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/ae/normal.jpg" alt="" style="height: 50px; width:50px;"></img> | **Normal** | normal | false | |
|<img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/ae/blinded.jpg" alt="" style="height: 50px; width:50px;"></img> | **Blinded** | blinded | false | |
|<img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/ae/darkvision.jpg" alt="" style="height: 50px; width:50px;"></img> | **Darkvision** | darkvision | false | |
|<img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/ae/tremorsense.jpg" alt="" style="height: 50px; width:50px;"></img> | **Tremor Sense** | tremorsense | true | <img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/invisible.jpg" alt="" style="height: 50px; width:50px;"></img><img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/obscured.jpg" alt="" style="height: 50px; width:50px;"></img><img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/indarkness.jpg" alt="" style="height: 50px; width:50px;"></img> |
|<img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/ae/seeinvisible.jpg" alt="" style="height: 50px; width:50px;"></img> | **See invisible** | seeinvisible | false | <img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/invisible.jpg" alt="" style="height: 50px; width:50px;"></img> |
|<img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/ae/blindsight.jpg" alt="" style="height: 50px; width:50px;"></img> | **Blind Sight** | blindsight | false | <img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/invisible.jpg" alt="" style="height: 50px; width:50px;"></img> <img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/obscured.jpg" alt="" style="height: 50px; width:50px;"></img> <img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/indarkness.jpg" alt="" style="height: 50px; width:50px;"></img> |
|<img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/ae/truesight.jpg" alt="" style="height: 50px; width:50px;"></img> | **True Sight** | truesight | false | <img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/invisible.jpg" alt="" style="height: 50px; width:50px;"></img> <img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/indarkness.jpg" alt="" style="height: 50px; width:50px;"></img> |
|<img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/ae/devilssight.jpg" alt="" style="height: 50px; width:50px;"></img> | **Devil's sight** | devilssight | false | <img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/indarkness.jpg" alt="" style="height: 50px; width:50px;"></img> |

### Conditions

| Image | Condition Level | effectId used on the module | Check Elevation |
|:------|:----------------|:---------------------------:|:---------------:|
|<img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/hidden.jpg" alt="" style="height: 50px; width:50px;"></img> | Hidden | hidden | false |
|<img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/invisible.jpg" alt="" style="height: 50px; width:50px;"></img> | Invisible | invisible | false |
|<img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/obscured.jpg" alt="" style="height: 50px; width:50px;"></img> | Obscured | obscured | false |
|<img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/indarkness.jpg" alt="" style="height: 50px; width:50px;"></img> | In darkness | indarkness | false |
|<img src="https://raw.githubusercontent.com/p4535992/conditional-visibility/master/src/icons/ae/stealthed.jpg" alt="" style="height: 50px; width:50px;"></img> | Stealthed | stealthed | false |
