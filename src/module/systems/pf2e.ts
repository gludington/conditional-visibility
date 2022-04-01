import { ConditionalVisibilityEffectDefinitions } from '../conditional-visibility-effect-definition';
import { AtcvEffectSenseFlags, AtcvEffectConditionFlags, SenseData } from '../conditional-visibility-models';
import CONSTANTS from '../constants';

/*
HP: data.hp.value
Perception: data.perception.value
Passive perception: data.perception.value + 10
Stealth: data.skills.ste
Stealth active: data.skills.ste.value
Stealth passive: data.skills.ste.value + 10
*/
export default {
  HP_ATTRIBUTE: 'data.hp.value',
  PERCEPTION_PASSIVE_SKILL: `data.perception.value`,
  STEALTH_PASSIVE_SKILL: `data.skills.ste.value`,
  STEALTH_ACTIVE_SKILL: `data.skills.ste.value`,
  // STEALTH_ID_SKILL: `data.skills.ste`,
  STEALTH_ID_LANG_SKILL: `PF2E.SkillSte`, // SkillStealth
  PATH_ATTRIBUTES_SENSES: `data.attributes.senses`,
  NPC_TYPE: `npc`,
  SENSES: <SenseData[]>[
    {
      id: AtcvEffectSenseFlags.NONE,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.NONE}`,
      path: '',
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/light_01.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
    },
    {
      id: AtcvEffectSenseFlags.NORMAL,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.NORMAL}`,
      path: 'data.traits.senses.blinded',
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/light_02.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
    },
    {
      id: AtcvEffectSenseFlags.BLINDED,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.BLINDED}`,
      path: 'data.traits.senses.blinded',
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/affliction_24.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
    },
    {
      id: AtcvEffectSenseFlags.LOW_LIGHT_VISION,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.LOW_LIGHT_VISION}`,
      path: 'data.traits.senses.lowlightvision',
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/violet_09.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
    },
    {
      id: AtcvEffectSenseFlags.DARKVISION,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.DARKVISION}`,
      path: 'data.traits.senses.darkvision',
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/evil-eye-red-1.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
    },
    {
      id: AtcvEffectSenseFlags.GREATER_DARKVISION,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.GREATER_DARKVISION}`,
      path: 'data.traits.senses.greaterdarkvision',
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/evil-eye-eerie-1.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
    },
  ],
  CONDITIONS: <SenseData[]>[
    {
      id: AtcvEffectConditionFlags.HIDDEN,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectConditionFlags.HIDDEN}`,
      path: ``,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/newspaper.jpg`,
      conditionType: 'condition',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
    },
    {
      id: AtcvEffectConditionFlags.INVISIBLE,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectConditionFlags.INVISIBLE}`,
      path: undefined,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/unknown.jpg`,
      conditionType: 'condition',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
    },
    {
      id: AtcvEffectConditionFlags.OBSCURED,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectConditionFlags.OBSCURED}`,
      path: undefined,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/foggy.jpg`,
      conditionType: 'condition',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
    },
    {
      id: AtcvEffectConditionFlags.IN_DARKNESS,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectConditionFlags.IN_DARKNESS}`,
      path: undefined,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/moon.jpg`,
      conditionType: 'condition',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
    },
  ],
};
