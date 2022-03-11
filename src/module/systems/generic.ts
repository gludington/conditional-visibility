import { ConditionalVisibilityEffectDefinitions } from '../conditional-visibility-effect-definition';
import { AtcvEffectConditionFlags, SenseData } from '../conditional-visibility-models';
import CONSTANTS from '../constants';

export default {
  VISION_LEVEL: {},
  PERCEPTION_PASSIVE_SKILL: ``,
  STEALTH_PASSIVE_SKILL: ``,
  STEALTH_ACTIVE_SKILL: ``,
  NPC_TYPE: ``,
  SENSES: <SenseData[]>[],
  CONDITIONS: <SenseData[]>[
    {
      id: AtcvEffectConditionFlags.HIDDEN,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectConditionFlags.HIDDEN}`,
      path: ``, //`data.skills.ste.passive`,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/newspaper.jpg`,
      visionLevelMinIndex: 0,
      visionLevelMaxIndex: 1,
      conditionElevation: false,
    },
  ],
};
