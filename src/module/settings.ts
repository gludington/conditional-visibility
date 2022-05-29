import API from './api';
import CONSTANTS from './constants';
import { dialogWarning, i18n, warn } from './lib/lib';
import { SYSTEMS } from './systems';

export const registerSettings = function (): void {
  game.settings.registerMenu(CONSTANTS.MODULE_NAME, 'resetAllSettings', {
    name: `${CONSTANTS.MODULE_NAME}.setting.reset.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.reset.hint`,
    icon: 'fas fa-coins',
    type: ResetSettingsDialog,
    restricted: true,
  });

  // =====================================================================

  // game.settings.register(CONSTANTS.MODULE_NAME, 'useEagleEye', {
  //   name: `${CONSTANTS.MODULE_NAME}.setting.useEagleEye.name`,
  //   hint: `${CONSTANTS.MODULE_NAME}.setting.useEagleEye.hint`,
  //   scope: 'world',
  //   config: true,
  //   default: false,
  //   type: Boolean,
  // });

  game.settings.register(CONSTANTS.MODULE_NAME, 'enableSightCheckForGM', {
    name: `${CONSTANTS.MODULE_NAME}.setting.enableSightCheckForGM.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.enableSightCheckForGM.hint`,
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'enableHud', {
    name: `${CONSTANTS.MODULE_NAME}.setting.enableHud.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.enableHud.hint`,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  /** Which column should the button be placed on */
  game.settings.register(CONSTANTS.MODULE_NAME, 'hudColumn', {
    name: i18n(`${CONSTANTS.MODULE_NAME}.setting.hudColumn.title`),
    hint: i18n(`${CONSTANTS.MODULE_NAME}.setting.hudColumn.hint`),
    scope: 'world',
    config: true,
    type: String,
    default: 'Left',
    choices: <any>{
      Left: 'Left',
      Right: 'Right',
    },
  });

  /** Whether the button should be placed on the top or bottom of the column */
  game.settings.register(CONSTANTS.MODULE_NAME, 'hudTopBottom', {
    name: i18n(`${CONSTANTS.MODULE_NAME}.setting.hudTopBottom.title`),
    hint: i18n(`${CONSTANTS.MODULE_NAME}.setting.hudTopBottom.hint`),
    scope: 'world',
    config: true,
    type: String,
    default: 'Top',
    choices: <any>{
      Top: 'Top',
      Bottom: 'Bottom',
    },
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'disableForNonHostileNpc', {
    name: `${CONSTANTS.MODULE_NAME}.setting.disableForNonHostileNpc.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.disableForNonHostileNpc.hint`,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'disableDCEAutomaticImport', {
    name: `${CONSTANTS.MODULE_NAME}.setting.disableDCEAutomaticImport.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.disableDCEAutomaticImport.hint`,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  // game.settings.register(CONSTANTS.MODULE_NAME, 'autoStealth', {
  //   name: `${CONSTANTS.MODULE_NAME}.setting.autoStealth.name`,
  //   hint: `${CONSTANTS.MODULE_NAME}.setting.autoStealth.hint`,
  //   scope: 'world',
  //   config: true,
  //   default: false,
  //   type: Boolean,
  // });

  game.settings.register(CONSTANTS.MODULE_NAME, 'autoSkills', {
    name: `${CONSTANTS.MODULE_NAME}.setting.autoSkills.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.autoSkills.hint`,
    scope: 'world',
    config: true,
    default: true,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'autoSkillsSkipDialog', {
    name: `${CONSTANTS.MODULE_NAME}.setting.autoSkillsSkipDialog.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.autoSkillsSkipDialog.hint`,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  // game.settings.register(CONSTANTS.MODULE_NAME, 'autoPassivePerception', {
  //   name: `${CONSTANTS.MODULE_NAME}.setting.autoPassivePerception.name`,
  //   hint: `${CONSTANTS.MODULE_NAME}.setting.autoPassivePerception.hint`,
  //   scope: 'world',
  //   config: true,
  //   default: false,
  //   type: Boolean,
  // });

  // game.settings.register(CONSTANTS.MODULE_NAME, 'autoPerception', {
  //   name: `${CONSTANTS.MODULE_NAME}.setting.autoPerception.name`,
  //   hint: `${CONSTANTS.MODULE_NAME}.setting.autoPerception.hint`,
  //   scope: 'world',
  //   config: true,
  //   default: false,
  //   type: Boolean,
  // });

  game.settings.register(CONSTANTS.MODULE_NAME, 'enableDrawCVHandler', {
    name: `${CONSTANTS.MODULE_NAME}.setting.enableDrawCVHandler.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.enableDrawCVHandler.hint`,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  // game.settings.register(CONSTANTS.MODULE_NAME, 'enableFastModeCVHandler', {
  //   name: `${CONSTANTS.MODULE_NAME}.setting.enableFastModeCVHandler.name`,
  //   hint: `${CONSTANTS.MODULE_NAME}.setting.enableFastModeCVHandler.hint`,
  //   scope: 'world',
  //   config: true,
  //   default: false,
  //   type: Boolean,
  // });

  game.settings.register(CONSTANTS.MODULE_NAME, 'enableRefreshSightCVHandler', {
    name: `${CONSTANTS.MODULE_NAME}.setting.enableRefreshSightCVHandler.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.enableRefreshSightCVHandler.hint`,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  // game.settings.register(CONSTANTS.MODULE_NAME, 'doNotUseSocketLibFeature', {
  //   name: `${CONSTANTS.MODULE_NAME}.setting.doNotUseSocketLibFeature.name`,
  //   hint: `${CONSTANTS.MODULE_NAME}.setting.doNotUseSocketLibFeature.hint`,
  //   scope: 'world',
  //   config: true,
  //   type: Boolean,
  //   default: false,
  // });

  // ========================================================================

  game.settings.register(CONSTANTS.MODULE_NAME, 'debug', {
    name: `${CONSTANTS.MODULE_NAME}.setting.debug.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.debug.hint`,
    scope: 'client',
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'debugHooks', {
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'systemFound', {
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'systemNotFoundWarningShown', {
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, 'preconfiguredSystem', {
    name: `${CONSTANTS.MODULE_NAME}.setting.preconfiguredSystem.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.preconfiguredSystem.hint`,
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  });

  const settings = defaultSettings();
  for (const [name, data] of Object.entries(settings)) {
    game.settings.register(CONSTANTS.MODULE_NAME, name, <any>data);
  }

  // for (const [name, data] of Object.entries(otherSettings)) {
  //     game.settings.register(CONSTANTS.MODULE_NAME, name, data);
  // }
};

class ResetSettingsDialog extends FormApplication<FormApplicationOptions, object, any> {
  constructor(...args) {
    //@ts-ignore
    super(...args);
    //@ts-ignore
    return new Dialog({
      title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.title`),
      content:
        '<p style="margin-bottom:1rem;">' +
        game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.content`) +
        '</p>',
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.confirm`),
          callback: async () => {
            await applyDefaultSettings();
            window.location.reload();
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.cancel`),
        },
      },
      default: 'cancel',
    });
  }

  async _updateObject(event: Event, formData?: object): Promise<any> {
    // do nothing
  }
}

async function applyDefaultSettings() {
  const settings = defaultSettings(true);
  for (const [name, data] of Object.entries(settings)) {
    await game.settings.set(CONSTANTS.MODULE_NAME, name, data.default);
  }
  const settings2 = otherSettings(true);
  for (const [name, data] of Object.entries(settings2)) {
    //@ts-ignore
    await game.settings.set(CONSTANTS.MODULE_NAME, name, data.default);
  }
}

function defaultSettings(apply = false) {
  return {
    senses: {
      name: `${CONSTANTS.MODULE_NAME}.setting.senses.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.senses.hint`,
      scope: 'world',
      config: false,
      default: apply && SYSTEMS.DATA ? SYSTEMS.DATA.SENSES : [],
      type: Array,
    },
    conditions: {
      name: `${CONSTANTS.MODULE_NAME}.setting.conditions.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.conditions.hint`,
      scope: 'world',
      config: false,
      default: apply && SYSTEMS.DATA ? SYSTEMS.DATA.CONDITIONS : [],
      type: Array,
    },
    effects: {
      name: `${CONSTANTS.MODULE_NAME}.setting.effects.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.effects.hint`,
      scope: 'world',
      config: false,
      default: apply && SYSTEMS.DATA ? SYSTEMS.DATA.EFFECTS : [],
      type: Array,
    },
    skills: {
      name: `${CONSTANTS.MODULE_NAME}.setting.skills.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.skills.hint`,
      scope: 'world',
      config: false,
      default: apply && SYSTEMS.DATA ? SYSTEMS.DATA.SKILLS : [],
      type: Array,
    },
    npcType: {
      name: `${CONSTANTS.MODULE_NAME}.setting.npcType.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.npcType.hint`,
      scope: 'world',
      config: true,
      default: apply && SYSTEMS.DATA ? SYSTEMS.DATA.NPC_TYPE : '',
      type: String,
    },
    passivePerceptionSkill: {
      name: `${CONSTANTS.MODULE_NAME}.setting.passivePerceptionSkill.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.passivePerceptionSkill.hint`,
      scope: 'world',
      config: true,
      default: apply && SYSTEMS.DATA ? SYSTEMS.DATA.PERCEPTION_PASSIVE_SKILL : '',
      type: String,
    },
    passiveStealthSkill: {
      name: `${CONSTANTS.MODULE_NAME}.setting.passiveStealthSkill.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.passiveStealthSkill.hint`,
      scope: 'world',
      config: true,
      default: apply && SYSTEMS.DATA ? SYSTEMS.DATA.STEALTH_PASSIVE_SKILL : '',
      type: String,
    },
    activeStealthSkill: {
      name: `${CONSTANTS.MODULE_NAME}.setting.activeStealthSkill.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.activeStealthSkill.hint`,
      scope: 'world',
      config: true,
      default: apply && SYSTEMS.DATA ? SYSTEMS.DATA.STEALTH_ACTIVE_SKILL : '',
      type: String,
    },
    // idStealthSkill: {
    //   name: `${CONSTANTS.MODULE_NAME}.setting.idStealthSkill.name`,
    //   hint: `${CONSTANTS.MODULE_NAME}.setting.idStealthSkill.hint`,
    //   scope: 'world',
    //   config: true,
    //   default: apply && SYSTEMS.DATA ? SYSTEMS.DATA.STEALTH_ID_SKILL : '',
    //   type: String,
    // },
    // idLangStealthSkill: {
    //   name: `${CONSTANTS.MODULE_NAME}.setting.idLangStealthSkill.name`,
    //   hint: `${CONSTANTS.MODULE_NAME}.setting.idLangStealthSkill.hint`,
    //   scope: 'world',
    //   config: true,
    //   default: apply && SYSTEMS.DATA ? SYSTEMS.DATA.STEALTH_ID_LANG_SKILL : '',
    //   type: String,
    // },
    pathAttributesSenses: {
      name: `${CONSTANTS.MODULE_NAME}.setting.pathAttributesSenses.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.pathAttributesSenses.hint`,
      scope: 'world',
      config: true,
      default: apply && SYSTEMS.DATA ? SYSTEMS.DATA.PATH_ATTRIBUTES_SENSES : '',
      type: String,
    },
  };
}

function otherSettings(apply = false) {
  return {
    debug: {
      name: `${CONSTANTS.MODULE_NAME}.setting.debug.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.debug.hint`,
      scope: 'client',
      config: true,
      default: false,
      type: Boolean,
    },

    debugHooks: {
      name: `${CONSTANTS.MODULE_NAME}.setting.debugHooks.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.debugHooks.hint`,
      scope: 'world',
      config: false,
      default: false,
      type: Boolean,
    },

    systemFound: {
      name: `${CONSTANTS.MODULE_NAME}.setting.systemFound.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.systemFound.hint`,
      scope: 'world',
      config: false,
      default: false,
      type: Boolean,
    },

    systemNotFoundWarningShown: {
      name: `${CONSTANTS.MODULE_NAME}.setting.systemNotFoundWarningShown.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.systemNotFoundWarningShown.hint`,
      scope: 'world',
      config: false,
      default: false,
      type: Boolean,
    },

    preconfiguredSystem: {
      name: `${CONSTANTS.MODULE_NAME}.setting.preconfiguredSystem.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.preconfiguredSystem.hint`,
      scope: 'world',
      config: false,
      default: false,
      type: Boolean,
    },

    // =======================================

    // useEagleEye: {
    //   name: `${CONSTANTS.MODULE_NAME}.setting.useEagleEye.name`,
    //   hint: `${CONSTANTS.MODULE_NAME}.setting.useEagleEye.hint`,
    //   scope: 'world',
    //   config: true,
    //   default: false,
    //   type: Boolean,
    // },

    enableSightCheckForGM: {
      name: `${CONSTANTS.MODULE_NAME}.setting.enableSightCheckForGM.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.enableSightCheckForGM.hint`,
      scope: 'world',
      config: true,
      default: true,
      type: Boolean,
    },

    enableHud: {
      name: `${CONSTANTS.MODULE_NAME}.setting.enableHud.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.enableHud.hint`,
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
    },

    /** Which column should the button be placed on */
    hudColumn: {
      name: i18n(`${CONSTANTS.MODULE_NAME}.setting.hudColumn.title`),
      hint: i18n(`${CONSTANTS.MODULE_NAME}.setting.hudColumn.hint`),
      scope: 'world',
      config: true,
      type: String,
      default: 'Left',
      choices: <any>{
        Left: 'Left',
        Right: 'Right',
      },
    },

    /** Whether the button should be placed on the top or bottom of the column */
    hudTopBottom: {
      name: i18n(`${CONSTANTS.MODULE_NAME}.setting.hudTopBottom.title`),
      hint: i18n(`${CONSTANTS.MODULE_NAME}.setting.hudTopBottom.hint`),
      scope: 'world',
      config: true,
      type: String,
      default: 'Top',
      choices: <any>{
        Top: 'Top',
        Bottom: 'Bottom',
      },
    },

    disableForNonHostileNpc: {
      name: `${CONSTANTS.MODULE_NAME}.setting.disableForNonHostileNpc.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.disableForNonHostileNpc.hint`,
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
    },

    disableDCEAutomaticImport: {
      name: `${CONSTANTS.MODULE_NAME}.setting.disableDCEAutomaticImport.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.disableDCEAutomaticImport.hint`,
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
    },

    // autoStealth: {
    //   name: `${CONSTANTS.MODULE_NAME}.setting.autoStealth.name`,
    //   hint: `${CONSTANTS.MODULE_NAME}.setting.autoStealth.hint`,
    //   scope: 'world',
    //   config: true,
    //   default: false,
    //   type: Boolean,
    // },

    autoSkills: {
      name: `${CONSTANTS.MODULE_NAME}.setting.autoSkills.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.autoSkills.hint`,
      scope: 'world',
      config: true,
      default: true,
      type: Boolean,
    },

    autoSkillsSkipDialog: {
      name: `${CONSTANTS.MODULE_NAME}.setting.autoSkillsSkipDialog.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.autoSkillsSkipDialog.hint`,
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
    },

    // autoPassivePerception: {
    //   name: `${CONSTANTS.MODULE_NAME}.setting.autoPassivePerception.name`,
    //   hint: `${CONSTANTS.MODULE_NAME}.setting.autoPassivePerception.hint`,
    //   scope: 'world',
    //   config: true,
    //   default: false,
    //   type: Boolean,
    // },

    // autoPerception: {
    //   name: `${CONSTANTS.MODULE_NAME}.setting.autoPerception.name`,
    //   hint: `${CONSTANTS.MODULE_NAME}.setting.autoPerception.hint`,
    //   scope: 'world',
    //   config: true,
    //   default: false,
    //   type: Boolean,
    // },

    enableDrawCVHandler: {
      name: `${CONSTANTS.MODULE_NAME}.setting.enableDrawCVHandler.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.enableDrawCVHandler.hint`,
      scope: 'world',
      config: true,
      type: Boolean,
      default: false,
    },

    // enableFastModeCVHandler: {
    //   name: `${CONSTANTS.MODULE_NAME}.setting.enableFastModeCVHandler.name`,
    //   hint: `${CONSTANTS.MODULE_NAME}.setting.enableFastModeCVHandler.hint`,
    //   scope: 'world',
    //   config: true,
    //   default: false,
    //   type: Boolean,
    // },

    enableRefreshSightCVHandler: {
      name: `${CONSTANTS.MODULE_NAME}.setting.enableRefreshSightCVHandler.name`,
      hint: `${CONSTANTS.MODULE_NAME}.setting.enableRefreshSightCVHandler.hint`,
      scope: 'world',
      config: true,
      default: false,
      type: Boolean,
    },

    // doNotUseSocketLibFeature: {
    //   name: `${CONSTANTS.MODULE_NAME}.setting.doNotUseSocketLibFeature.name`,
    //   hint: `${CONSTANTS.MODULE_NAME}.setting.doNotUseSocketLibFeature.hint`,
    //   scope: 'world',
    //   config: true,
    //   type: Boolean,
    //   default: true,
    // },
  };
}

export async function checkSystem() {
  if (!SYSTEMS.DATA) {
    if (game.settings.get(CONSTANTS.MODULE_NAME, 'systemNotFoundWarningShown')) return;

    await game.settings.set(CONSTANTS.MODULE_NAME, 'systemNotFoundWarningShown', true);

    return Dialog.prompt({
      title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.nosystemfound.title`),
      content: dialogWarning(game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.nosystemfound.content`)),
      callback: () => {},
    });
  }

  if (game.settings.get(CONSTANTS.MODULE_NAME, 'systemFound')) return;

  game.settings.set(CONSTANTS.MODULE_NAME, 'systemFound', true);

  if (game.settings.get(CONSTANTS.MODULE_NAME, 'systemNotFoundWarningShown')) {
    return new Dialog({
      title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.systemfound.title`),
      content: warn(game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.systemfound.content`), true),
      buttons: {
        confirm: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.systemfound.confirm`),
          callback: () => {
            applyDefaultSettings();
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('No'),
        },
      },
      default: 'cancel',
    }).render(true);
  }

  return applyDefaultSettings();
}
