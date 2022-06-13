import {
  AtcvEffectConditionFlags,
  AtcvEffectSenseFlags,
  CVSkillData,
  SenseData,
} from '../conditional-visibility-models';
import CONSTANTS from '../constants';
import type Effect from '../effects/effect';

/**
Data path to 'HP':
Data path to 'Perception':
Data path to 'Passive perception':
Data path to 'Stealth':
Data path to 'Stealth active':
Data path to 'Stealth passive':
Data path to 'Senses':
 */
export default {
  VISION_LEVEL: {},
  PERCEPTION_PASSIVE_SKILL: ``,
  STEALTH_PASSIVE_SKILL: ``,
  STEALTH_ACTIVE_SKILL: ``,
  // STEALTH_ID_SKILL: ``,
  // STEALTH_ID_LANG_SKILL: ``,
  PATH_ATTRIBUTES_SENSES: ``,
  STEALTH_PASSIVE_EFFECTS: [],
  NPC_TYPE: ``,
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
      conditionBlinded: false,
      conditionBlindedOverride: false,
    },
    {
      id: AtcvEffectSenseFlags.NORMAL,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.NORMAL}`,
      path: ``,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/light_02.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: false,
    },
  ],
  CONDITIONS: <SenseData[]>[
    {
      id: AtcvEffectConditionFlags.HIDDEN,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectConditionFlags.HIDDEN}`,
      path: ``, //`data.skills.ste.passive`,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/newspaper.jpg`,
      conditionType: 'condition',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: false,
    },
  ],
  EFFECTS: <Effect[]>[],
  SKILLS: <CVSkillData[]>[],
};
