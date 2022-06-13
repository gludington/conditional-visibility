import {
  AtcvEffectSenseFlags,
  AtcvEffectConditionFlags,
  SenseData,
  CVSkillData,
} from '../conditional-visibility-models';
import CONSTANTS from '../constants';
import type Effect from '../effects/effect';

/*
Data path to 'HP': data.attributes.hp.value
Data path to 'Perception': data.skills.per.mod
Data path to 'Passive perception': absent
Data path to 'Stealth': data.skills.ste.mod
Data path to 'Stealth active': absent
Data path to 'Stealth passive': absent
Data path to 'Senses': data.traits.senses
*/
export default {
  HP_ATTRIBUTE: 'data.attributes.hp.value',
  PERCEPTION_PASSIVE_SKILL: ``,
  STEALTH_PASSIVE_SKILL: ``,
  STEALTH_ACTIVE_SKILL: `data.skills.ste.mod`,
  // STEALTH_ID_SKILL: `data.skills.ste`,
  // STEALTH_ID_LANG_SKILL: `PF1.SkillSte`, // SkillStealth
  PATH_ATTRIBUTES_SENSES: `data.attributes.senses`,
  STEALTH_PASSIVE_EFFECTS: [AtcvEffectConditionFlags.STEALTHED],
  NPC_TYPE: `npc`,
  SENSES: <SenseData[]>[
    {
      id: AtcvEffectSenseFlags.NONE,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.NONE}`,
      path: '',
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/none.jpg`,
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
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/normal.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: false,
    },
    {
      id: AtcvEffectSenseFlags.BLINDED,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.BLINDED}`,
      path: 'data.traits.senses.blinded',
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/blinded.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: true,
      conditionBlindedOverride: false,
    },
    {
      id: AtcvEffectSenseFlags.LOW_LIGHT_VISION,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.LOW_LIGHT_VISION}`,
      path: 'data.traits.senses.lowlightvision',
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/lowlightvision.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: false,
    },
    {
      id: AtcvEffectSenseFlags.DARKVISION,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.DARKVISION}`,
      path: 'data.traits.senses.darkvision',
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/darkvision.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: false,
    },
    {
      id: AtcvEffectSenseFlags.TREMOR_SENSE,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.TREMOR_SENSE}`,
      path: `data.attributes.senses.tremorsense`,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/tremorsense.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: true,
      conditionBlinded: false,
      conditionBlindedOverride: true,
    },
    {
      id: AtcvEffectSenseFlags.SEE_INVISIBILITY,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.SEE_INVISIBILITY}`,
      path: `data.attributes.senses.seeinvisibility`, // data.attributes.senses.special
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/seeinvisibility.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: false,
    },
    {
      id: AtcvEffectSenseFlags.BLIND_SIGHT,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.BLIND_SIGHT}`,
      path: `data.attributes.senses.blindsight`,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/blindsight.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: true,
    },
    {
      id: AtcvEffectSenseFlags.BLIND_SENSE,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.BLIND_SENSE}`,
      path: `data.attributes.senses.blindsense`,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/blindsense.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: true,
    },
    {
      id: AtcvEffectSenseFlags.SCENT,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.SCENT}`,
      path: `data.attributes.senses.scent`,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/scent.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: false,
    },
    {
      id: AtcvEffectSenseFlags.TRUE_SIGHT,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.TRUE_SIGHT}`,
      path: `data.attributes.senses.truesight`,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/truesight.jpg`,
      conditionType: 'sense',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: false,
    },
    {
      id: AtcvEffectSenseFlags.SEE_IN_DARKNESS,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectSenseFlags.SEE_IN_DARKNESS}`,
      path: ``,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/seeindarkness.jpg`,
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
      id: AtcvEffectConditionFlags.NONE,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectConditionFlags.NONE}`,
      path: ``,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/none.jpg`,
      conditionType: 'condition',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: false,
    },
    {
      id: AtcvEffectConditionFlags.STEALTHED,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectConditionFlags.STEALTHED}`,
      path: ``, //`data.skills.ste.passive`,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/ae/stealthed.jpg`,
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: false,
    },
    {
      id: AtcvEffectConditionFlags.HIDDEN,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectConditionFlags.HIDDEN}`,
      path: ``,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/hidden.jpg`,
      conditionType: 'condition',
      conditionSources: <string[]>[],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: false,
    },
    {
      id: AtcvEffectConditionFlags.INVISIBLE,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectConditionFlags.INVISIBLE}`,
      path: undefined,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/invisible.jpg`,
      conditionType: 'condition',
      conditionSources: <string[]>[AtcvEffectSenseFlags.SEE_INVISIBILITY],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: false,
    },
    {
      id: AtcvEffectConditionFlags.IN_DARKNESS,
      name: `${CONSTANTS.MODULE_NAME}.${AtcvEffectConditionFlags.IN_DARKNESS}`,
      path: undefined,
      img: `modules/${CONSTANTS.MODULE_NAME}/icons/indarkness.jpg`,
      conditionType: 'condition',
      conditionSources: <string[]>[
        AtcvEffectSenseFlags.BLIND_SIGHT,
        AtcvEffectSenseFlags.BLIND_SENSE,
        AtcvEffectSenseFlags.TREMOR_SENSE,
        AtcvEffectSenseFlags.SEE_IN_DARKNESS,
        AtcvEffectSenseFlags.TRUE_SIGHT,
      ],
      conditionTargets: <string[]>[],
      conditionElevation: false,
      conditionBlinded: false,
      conditionBlindedOverride: false,
    },
  ],
  EFFECTS: <Effect[]>[],
  SKILLS: <CVSkillData[]>[
    {
      id: 'acrobatics',
      name: 'PF1.SkillAcr',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/acrobatics.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'appraise',
      name: 'PF1.SkillApr',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/appraise.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'artistry',
      name: 'PF1.SkillArt',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/artistry.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'bluff',
      name: 'PF1.SkillBlf',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/bluff.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'climb',
      name: 'PF1.SkillClm',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/climb.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'craft',
      name: 'PF1.SkillCrf',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/craft.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'diplomacy',
      name: 'PF1.SkillDip',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/diplomacy.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'disable_device',
      name: 'PF1.SkillDev',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/disable_device.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'disguise',
      name: 'PF1.SkillDis',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/disguise.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'escape_artist',
      name: 'PF1.SkillEsc',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/escape_artist.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'fly',
      name: 'PF1.SkillFly',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/fly.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'handle_animal',
      name: 'PF1.SkillHan',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/handle_animal.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'heal',
      name: 'PF1.SkillHea',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/heal.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'intimidate',
      name: 'PF1.SkillInt',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/intimidate.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'knowledge_arcana',
      name: 'PF1.SkillKAr',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/knowledge_arcana.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'knowledge_dungeoneering',
      name: 'PF1.SkillKDu',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/knowledge_dungeoneering.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'knowledge_engineering',
      name: 'PF1.SkillKEn',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/knowledge_engineering.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'knowledge_geography',
      name: 'PF1.SkillKGe',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/knowledge_geography.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'knowledge_history',
      name: 'PF1.SkillKHi',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/knowledge_history.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'knowledge_local',
      name: 'PF1.SkillKLo',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/knowledge_local.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'knowledge_nature',
      name: 'PF1.SkillKNa',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/knowledge_nature.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'knowledge_nobility',
      name: 'PF1.SkillKNo',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/knowledge_nobility.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'knowledge_planes',
      name: 'PF1.SkillKPl',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/knowledge_planes.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'knowledge_religion',
      name: 'PF1.SkillKRe',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/knowledge_religion.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'linguistics',
      name: 'PF1.SkillLin',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/linguistics.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'lore',
      name: 'PF1.SkillLor',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/lore.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'perception',
      name: 'PF1.SkillPer',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/perception.svg`,
      enable: true,
      senseData: {
        id: 'perception',
        name: 'DND5E.SkillPrc',
        path: ``,
        img: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/perception.svg`,
        conditionType: 'sense',
        conditionSources: <string[]>[],
        conditionTargets: <string[]>[],
        conditionElevation: false,
        conditionBlinded: false,
        conditionBlindedOverride: false,
      },
    },
    {
      id: 'perform',
      name: 'PF1.SkillPrf',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/perform.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'profession',
      name: 'PF1.SkillPro',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/profession.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'ride',
      name: 'PF1.SkillRid',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/ride.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'sense_motive',
      name: 'PF1.SkillSen',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/sense_motive.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'sleight_of_hand',
      name: 'PF1.SkillSlt',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/sleight_of_hand.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'spellcraft',
      name: 'PF1.SkillSpl',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/spellcraft.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'stealth',
      name: 'PF1.SkillSte',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/stealth.svg`,
      enable: true,
      senseData: {
        id: 'stealth',
        name: 'DND5E.SkillSte',
        path: ``,
        img: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/stealth.svg`,
        conditionType: 'condition',
        conditionSources: <string[]>['perception'],
        conditionTargets: <string[]>[],
        conditionElevation: false,
        conditionBlinded: false,
        conditionBlindedOverride: false,
      },
    },
    {
      id: 'survival',
      name: 'PF1.SkillSur',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/survival.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'swim',
      name: 'PF1.SkillSwm',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/swim.svg`,
      enable: false,
      senseData: null,
    },
    {
      id: 'use_magic_device',
      name: 'PF1.SkillUMD',
      icon: `/modules/${CONSTANTS.MODULE_NAME}/icons/skills/use_magic_device.svg`,
      enable: false,
      senseData: null,
    },
  ],
};
