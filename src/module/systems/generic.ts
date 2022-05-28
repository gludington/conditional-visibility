import { ConditionalVisibilityEffectDefinitions } from '../conditional-visibility-effect-definition';
import { AtcvEffectConditionFlags, CVSkillData, SenseData } from '../conditional-visibility-models';
import CONSTANTS from '../constants';
import type Effect from '../effects/effect';

export default {
  VISION_LEVEL: {},
  PERCEPTION_PASSIVE_SKILL: ``,
  STEALTH_PASSIVE_SKILL: ``,
  STEALTH_ACTIVE_SKILL: ``,
  // STEALTH_ID_SKILL: ``,
  STEALTH_ID_LANG_SKILL: ``,
  PATH_ATTRIBUTES_SENSES: ``,
  NPC_TYPE: ``,
  SENSES: <SenseData[]>[],
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
