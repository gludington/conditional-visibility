/**
 * Builds a mapping between status icons and journal entries that represent conditions
 */
export interface EnhancedConditions {
  /* -------------------------------------------- */
  /*                   Handlers                   */
  /* -------------------------------------------- */

  // /**
  //  * Ready Hook handler
  //  * Steps:
  //  * 1. Get default maps
  //  * 2. Get mapType
  //  * 3. Get Condition Map
  //  * 4. Override status effects
  //  */
  //  async _onReady() {
  //     game.cub.enhancedConditions.supported = false;
  //     const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

  //     // Return early if gadget not enabled
  //     if (!enable) return;

  //     if (CONFIG.statusEffects.length && typeof CONFIG.statusEffects[0] == "string") {
  //         console.warn(game.i18n.localize(`ENHANCED_CONDITIONS.SimpleIconsNotSupported`));
  //         return;
  //     }

  //     let defaultMaps = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps);
  //     let conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

  //     const system = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.system);
  //     const mapType = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType);
  //     const defaultMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default);

  //     // If there's no defaultMaps or defaultMaps doesn't include game system, check storage then set appropriately
  //     if (!defaultMaps || (defaultMaps instanceof Object && Object.keys(defaultMaps).length === 0) || (defaultMaps instanceof Object && !Object.keys(defaultMaps).includes(system))) {
  //         if (game.user.isGM) {
  //             defaultMaps = await EnhancedConditions._loadDefaultMaps();
  //             Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps, defaultMaps);
  //         }
  //     }

  //     // If map type is not set and a default map exists for the system, set maptype to default
  //     if (!mapType && (defaultMaps instanceof Object && Object.keys(defaultMaps).includes(system))) {

  //         Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, defaultMapType);
  //     }

  //     // If there's no condition map, get the default one
  //     if (!conditionMap.length) {
  //         // Pass over defaultMaps since the storage version is still empty
  //         conditionMap = EnhancedConditions.getDefaultMap(system, defaultMaps);

  //         if (game.user.isGM) {
  //             const preparedMap = EnhancedConditions._prepareMap(conditionMap);

  //             if (preparedMap?.length) {
  //                 conditionMap = preparedMap?.length ? preparedMap : conditionMap;
  //                 Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, preparedMap);
  //             }
  //         }
  //     }

  //     // If map type is not set, now set to default
  //     if (!mapType && conditionMap.length) {
  //         Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, defaultMapType);
  //     }

  //     // If the gadget is enabled, update status icons accordingly
  //     if (enable) {
  //         if (game.user.isGM) {
  //             EnhancedConditions._backupCoreEffects();
  //             // If the reminder is not suppressed, advise users to save the Condition Lab
  //             const suppressPreventativeSaveReminder = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.suppressPreventativeSaveReminder);
  //             if (!suppressPreventativeSaveReminder) {
  //                 EnhancedConditions._preventativeSaveReminder();
  //             }
  //         }

  //         if (conditionMap.length) EnhancedConditions._updateStatusEffects(conditionMap);
  //     }

  //     // Save the active condition map to a convenience property
  //     if (game.cub) {
  //         game.cub.conditions = conditionMap;
  //     }

  //     game.cub.enhancedConditions.supported = true;
  // }

  // /**
  //  * Handle PreUpdate Token Hook.
  //  * If the update includes effect data, add an `option` for the update hook handler to look for
  //  * @param {*} scene
  //  * @param {*} update
  //  * @param {*} options
  //  * @param {*} userId
  //  */
  //  _onPreUpdateToken(token, update, options, userId) {
  //     const cubOption = options[BUTLER.NAME] = options[BUTLER.NAME] ?? {};

  //     if (hasProperty(update, "actorData.effects")) {
  //         cubOption.existingEffects = token.data.actorData.effects ?? [];
  //         cubOption.updateEffects = update.actorData.effects ?? [];
  //     }

  //     if (hasProperty(update, "overlayEffect")) {
  //         cubOption.existingOverlay = token.data.overlayEffect ?? null;
  //         cubOption.updateOverlay = update.overlayEffect ?? null;
  //     }

  //     return true;
  // }

  // /**
  //  * Hooks on token updates. If the update includes effects, calls the journal entry lookup
  //  */
  //  _onUpdateToken(token, update, options, userId) {
  //     const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

  //     if (!enable || !game.user.isGM || (game.users.get(userId).isGM && game.userId !== userId)) {
  //         return;
  //     }

  //     if (!hasProperty(options, `${BUTLER.NAME}`)) return;

  //     const cubOption = options[BUTLER.NAME];
  //     const addUpdate = cubOption ? cubOption?.updateEffects?.length > cubOption?.existingEffects?.length : false;
  //     const removeUpdate = cubOption ? cubOption?.existingEffects?.length > cubOption?.updateEffects?.length : false;
  //     const updateEffects = [];

  //     if (addUpdate) {
  //         for (const e of cubOption.updateEffects) {
  //             if (!cubOption.existingEffects.find(x => x._id === e._id)) updateEffects.push({effect: e, type: "effect", changeType: "add"});
  //         }
  //     }

  //     if (removeUpdate) {
  //         for (const e of cubOption.existingEffects) {
  //             if (!cubOption.updateEffects.find(u => u._id === e._id)) updateEffects.push({effect: e, type: "effect", changeType: "remove"});
  //         }
  //     }

  //     if (!cubOption.existingOverlay && cubOption.updateOverlay) updateEffects.push({effect: cubOption.updateOverlay, type: "overlay", changeType: "add"});
  //     else if (cubOption.existingOverlay && !cubOption.updateOverlay) updateEffects.push({effect: cubOption.existingOverlay, type: "overlay", changeType: "remove"});

  //     if (!updateEffects.length) return;

  //     const addConditions = [];
  //     const removeConditions = [];

  //     for (const effect of updateEffects) {
  //         let condition = null;
  //         // based on the type, get the condition
  //         if (effect.type === "overlay") condition = EnhancedConditions.getConditionsByIcon(effect.effect)
  //         else if (effect.type === "effect") {
  //             if (!hasProperty(effect, `effect.flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.conditionId}`)) continue;
  //             const effectId = effect.effect.flags[BUTLER.NAME][BUTLER.FLAGS.enhancedConditions.conditionId];
  //             condition = EnhancedConditions.lookupEntryMapping(effectId);
  //         }

  //         if (!condition) continue;

  //         if (effect.changeType === "add") addConditions.push(condition);
  //         else if (effect.changeType === "remove") removeConditions.push(condition);
  //     }

  //     if (!addConditions.length && !removeConditions.length) return;

  //     const outputChatSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);

  //     // If any of the addConditions Marks Defeated, mark the token's combatants defeated
  //     if (addConditions.some(c => c?.options?.markDefeated)) EnhancedConditions._toggleDefeated(token);

  //     // If any of the removeConditions Marks Defeated, remove the defeated from the token's combatants
  //     if (removeConditions.some(c => c?.options?.markDefeated)) EnhancedConditions._toggleDefeated(token, {markDefeated: false});

  //     // If any of the conditions Removes Others, remove the other Conditions
  //     addConditions.some(c => {
  //         if (c?.options?.removeOthers) {
  //             EnhancedConditions._removeOtherConditions(token, c.id);
  //             return true;
  //         }
  //     });

  //     const chatAddConditions = addConditions.filter(c => outputChatSetting && c.options?.outputChat);
  //     const chatRemoveConditions = removeConditions.filter(c => outputChatSetting && c.options?.outputChat);

  //     // If there's any conditions to output to chat, do so
  //     if (chatAddConditions.length) EnhancedConditions.outputChatMessage(token, chatAddConditions, {type: "added"});
  //     if (chatRemoveConditions.length) EnhancedConditions.outputChatMessage(token, chatRemoveConditions, {type: "removed"});
  // }

  // /**
  //  * Create Active Effect handler
  //  * @param {*} actor
  //  * @param {*} update
  //  * @param {*} options
  //  * @param {*} userId
  //  */
  //  _onCreateActiveEffect(effect, options, userId) {
  //     const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

  //     if (!enable || !game.user.isGM || (game.users.get(userId).isGM && game.userId !== userId)) {
  //         return;
  //     }

  //     const actor = effect.parent;

  //     // Handled in Token Update handler
  //     if (actor?.isToken) return;

  //     EnhancedConditions._processActiveEffectChange(effect, "create");
  // }

  // /**
  //  * Create Active Effect handler
  //  * @param {*} actor
  //  * @param {*} update
  //  * @param {*} options
  //  * @param {*} userId
  //  */
  //  _onDeleteActiveEffect(effect, options, userId) {
  //     const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

  //     if (!enable || !game.user.isGM || (game.users.get(userId).isGM && game.userId !== userId)) {
  //         return;
  //     }

  //     const actor = effect.parent;

  //     // Handled in Token Update handler
  //     if (actor?.isToken) return;

  //     EnhancedConditions._processActiveEffectChange(effect, "delete");
  // }

  // /**
  //  * Update Combat Handler
  //  * @param {*} combat
  //  * @param {*} update
  //  * @param {*} options
  //  * @param {*} userId
  //  */
  //  _onUpdateCombat(combat, update, options, userId) {
  //     const enableEnhancedConditions = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);
  //     const enableOutputCombat = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputCombat);
  //     const outputChatSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);
  //     const combatant = combat.combatant;

  //     if (!hasProperty(update, "turn") || !combatant || !enableEnhancedConditions || !outputChatSetting || !enableOutputCombat|| !game.user.isGM) {
  //         return;
  //     }

  //     const token = combatant.token;

  //     if (!token) return;

  //     const tokenConditions = EnhancedConditions.getConditions(token, {warn: false});
  //     let conditions = (tokenConditions && tokenConditions.conditions) ? tokenConditions.conditions : [];
  //     conditions = conditions instanceof Array ? conditions : [conditions];

  //     if (!conditions.length) return;

  //     const chatConditions = conditions.filter(c => c.options?.outputChat);

  //     if (!chatConditions.length) return;

  //     EnhancedConditions.outputChatMessage(token, chatConditions, {type: "active"});
  // }

  // /**
  //  * Render Chat Message handler
  //  * @param {*} app
  //  * @param {*} html
  //  * @param {*} data
  //  * @todo move to chatlog render?
  //  */
  //  async _onRenderChatMessage(app, html, data) {
  //     if (data.message.content && !data.message.content.match("enhanced-conditions")) {
  //         return;
  //     }

  //     const speaker = data.message.speaker;

  //     if (!speaker) return;

  //     const actor = ChatMessage.getSpeakerActor(speaker);
  //     const token = (speaker.scene && speaker.token) ? await fromUuid(`Scene.${speaker.scene}.Token.${speaker.token}`) : null;

  //     const removeConditionAnchor = html.find("a[name='remove-row']");
  //     const undoRemoveAnchor = html.find("a[name='undo-remove']");

  //     if (!game.user.isGM) {
  //         removeConditionAnchor.parent().hide();
  //         undoRemoveAnchor.parent().hide();
  //     }

  //     /**
  //      * @todo #284 move to chatlog listener instead
  //      */
  //     removeConditionAnchor.on("click", event => {
  //         const conditionListItem = event.target.closest("li");
  //         const conditionName = conditionListItem.dataset.conditionName;
  //         const messageListItem = conditionListItem?.parentElement?.closest("li");
  //         const messageId = messageListItem?.dataset?.messageId;
  //         const message = messageId ? game.messages.get(messageId) : null;

  //         if (!message) return;

  //         const actor = ChatMessage.getSpeakerActor(message.data?.speaker);

  //         EnhancedConditions.removeCondition(conditionName, actor, {warn: false});
  //     });

  //     undoRemoveAnchor.on("click", event => {
  //         const conditionListItem = event.target.closest("li");
  //         const conditionName = conditionListItem.dataset.conditionName;
  //         const messageListItem = conditionListItem?.parentElement?.closest("li");
  //         const messageId = messageListItem?.dataset?.messageId;
  //         const message = messageId ? game.messages.get(messageId) : null;

  //         if (!message) return;

  //         const speaker = message?.data?.speaker;

  //         if (!speaker) return;

  //         const token = canvas.tokens.get(speaker.token);
  //         const actor = game.actors.get(speaker.actor);
  //         const entity = token ?? actor;

  //         if (!entity) return;

  //         EnhancedConditions.addCondition(conditionName, entity);
  //     });
  // }

  //  async _onRenderCombatTracker(app, html, data) {
  //     const enabled = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

  //     if (!enabled) return;

  //     const effectIcons = html.find("img[class='token-effect']");

  //     effectIcons.each((index, element) => {
  //         const url = new URL(element.src);
  //         const path = url?.pathname?.substring(1);
  //         const conditions = EnhancedConditions.getConditionsByIcon(path);
  //         const statusEffect = CONFIG.statusEffects.find(e => e.icon === path);

  //         if (conditions?.length) {
  //             element.title = conditions[0];
  //         } else if (statusEffect?.label) {
  //             element.title = game.i18n.localize(statusEffect.label);
  //         }
  //     });
  // }

  // /* -------------------------------------------- */
  // /*                    Workers                   */
  // /* -------------------------------------------- */

  // /**
  //  * Process the addition/removal of an Active Effect
  //  * @param {ActiveEffect} effect  the effect
  //  * @param {String} type  the type of change to process
  //  */
  //  _processActiveEffectChange(effect, type="create") {
  //     if (!(effect instanceof ActiveEffect)) return;

  //     const effectId = effect.getFlag(`${BUTLER.NAME}`, `${BUTLER.FLAGS.enhancedConditions.conditionId}`);
  //     if (!effectId) return;

  //     const condition = EnhancedConditions.lookupEntryMapping(effectId);

  //     if (!condition) return;

  //     const shouldOutput = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat) && condition.options.outputChat;
  //     const outputType = type === "delete" ? "removed" : "added";
  //     const actor = effect.parent;

  //     if (shouldOutput) EnhancedConditions.outputChatMessage(actor, condition, {type: outputType});

  //     switch (type) {
  //         case "create":
  //             // If condition marks combatants defeated, look for matching combatant

  //             if (condition.options?.removeOthers) EnhancedConditions._removeOtherConditions(actor, condition.id);
  //             break;

  //         case "delete":
  //             // If condition marks combatants defeated, untoggle defeated
  //             if (condition.options?.markDefeated) EnhancedConditions._toggleDefeated(actor, {markDefeated: false});

  //         default:
  //             break;
  //     }
  // }

  // /**
  //  * Checks statusEffect icons against map and returns matching condition mappings
  //  * @param {Array | String} effectIds  A list of effectIds, or a single effectId to check
  //  * @param {Array} [map=[]]  the condition map to look in
  //  */
  //  lookupEntryMapping(effectIds, map=[]) {
  //     if (!(effectIds instanceof Array)) {
  //         effectIds = [effectIds];
  //     }

  //     if (!map.length) {
  //         map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
  //         if (!map.length) return null;
  //     }

  //     const conditionEntries = map.filter(row => effectIds.includes(row.id ?? Sidekick.generateUniqueSlugId(row.name)));

  //     if (conditionEntries.length === 0) return;

  //     return conditionEntries.length > 1 ? conditionEntries : conditionEntries.shift();
  // }

  // /**
  //  * Output one or more condition entries to chat
  //  * @todo refactor to use actor or token
  //  */
  //  async outputChatMessage(entity, entries, options={type: "active"}) {
  //     const isActorEntity = entity instanceof Actor;
  //     const isTokenEntity = entity instanceof Token || entity instanceof TokenDocument;
  //     // Turn a single condition mapping entry into an array
  //     entries = entries instanceof Array ? entries : [entries];

  //     if (!entity || !entries.length) return;

  //     const type = {};

  //     switch (options.type) {
  //         case "added":
  //             type.added = true;
  //             break;

  //         case "removed":
  //             type.removed = true;
  //             break;

  //         case "active":
  //         default:
  //             type.active = true;
  //             break;
  //     }

  //     const chatUser = game.userId;
  //     //const token = token || this.currentToken;
  //     const chatType = CONST.CHAT_MESSAGE_TYPES.OTHER;
  //     const speaker = isActorEntity ? ChatMessage.getSpeaker({actor: entity}) : ChatMessage.getSpeaker({token: entity});

  //     // iterate over the entries and mark any with references for use in the template
  //     for(const [v, i, a] of entries) {
  //         if (v.referenceId) {
  //             if (!v.referenceId.match(/\{.+\}/)) {
  //                 v.referenceId += `{${v.name}}`;
  //             }

  //             a[i].hasReference = true;
  //         }
  //     });

  //     const templateData = {
  //         type,
  //         entityId: entity.id,
  //         alias: speaker.alias,
  //         conditions: entries,
  //         isOwner: entity.isOwner || game.user.isGM
  //     };

  //     const content = await renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.chatOutput, templateData);

  //     return await ChatMessage.create({
  //         speaker,
  //         content,
  //         type: chatType,
  //         user: chatUser
  //     });
  // }

  // /**
  //  * Marks a Combatants for a particular entity as defeated
  //  * @param {Actor | Token} entities  the entity to mark defeated
  //  * @param {Boolean} options.markDefeated  an optional state flag (default=true)
  //  */
  //  _toggleDefeated(entities, {markDefeated=true}={}) {
  //     const combat = game.combat;

  //     if (!entities) {
  //         // First check for any controlled tokens
  //         if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
  //         else if (game.user.character) entities = game.user.character;
  //     }

  //     if (!entities) {
  //         return;
  //     }

  //     entities = entities instanceof Array ? entities : [entities];

  //     const tokens = entities.flatMap(e => (e instanceof Token || e instanceof TokenDocument) ? e : e instanceof Actor ? e.getActiveTokens() : null);

  //     const updates = [];

  //     // loop through tokens, and if there's matching combatants, add them to the update
  //     for (const token of tokens) {

  //         const combatants = combat ? combat.combatants?.contents?.filter(c => c.data.tokenId === token.id && c.data.defeated != markDefeated) : [];

  //         if (!combatants.length) return;

  //         const update = combatants.map(c => {
  //             return {
  //                 _id: c.id,
  //                 defeated: markDefeated
  //             }
  //         });

  //         updates.push(update);
  //     }

  //     if (!updates.length) return;

  //     // update all combatants at once
  //     combat.updateEmbeddedDocuments("Combatant", updates.length > 1 ? update : updates.shift());
  // }

  // /**
  //  * For a given entity, removes conditions other than the one supplied
  //  * @param {*} entity
  //  * @param {*} conditionId
  //  */
  //  async _removeOtherConditions(entity, conditionId) {
  //     const entityConditions = EnhancedConditions.getConditions(entity, {warn: false});
  //     let conditions = entityConditions ? entityConditions.conditions : [];
  //     conditions = conditions instanceof Array ? conditions : [conditions];

  //     if (!conditions.length) return;

  //     const removeConditions = conditions.filter(c => c.id !== conditionId);

  //     if (!removeConditions.length) return;

  //     for (const c of removeConditions) await EnhancedConditions.removeCondition(c.name, entity, {warn: true});
  // }

  // /* -------------------------------------------- */
  // /*                    Helpers                   */
  // /* -------------------------------------------- */

  // /**
  //  * Creates a button for the Condition Lab
  //  * @param {Object} html the html element where the button will be created
  //  */
  //  _createLabButton(html) {
  //     if (!game.user.isGM) return;

  //     const cubDiv = html.find("#combat-utility-belt");

  //     const labButton = $(
  //         `<button id="condition-lab" data-action="condition-lab">
  //                 <i class="fas fa-flask"></i> ${BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionLab.title}
  //             </button>`
  //     );

  //     cubDiv.append(labButton);

  //     labButton.on("click", event => {
  //         if (game.cub.enhancedConditions.supported) {
  //             return game.cub.conditionLab = new ConditionLab().render(true)
  //         } else {
  //             ui.notifications.warn(game.i18n.localize(`ENHANCED_CONDITIONS.GameSystemNotSupported`));
  //         }

  //     });
  // }

  // /**
  //  * Determines whether to display the combat utility belt div in the settings sidebar
  //  * @param {Boolean} display
  //  * @todo: extract to helper in sidekick class?
  //  */
  //  _toggleLabButtonVisibility(display) {
  //     if (!game.user.isGM) {
  //         return;
  //     }

  //     let labButton = document.getElementById("condition-lab");

  //     if (display && labButton && labButton.style.display !== "block") {
  //         return labButton.style.display = "block";
  //     }

  //     if (labButton && !display && labButton.style.display !== "none") {
  //         return labButton.style.display = "none";
  //     }
  // }

  // /**
  //  * Returns the default maps supplied with the module
  //  *
  //  * @todo: map to entryId and then rebuild on import
  //  */
  //  async _loadDefaultMaps() {
  //     const source = "data";
  //     const path = BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionMapsPath;
  //     const jsons = await Sidekick.fetchJsons(source, path);

  //     const defaultMaps = jsons.filter(j => !j.system.includes("example")).reduce((obj, current) => {
  //         obj[current.system] = current.map;
  //         return obj;
  //     },{});

  //     return defaultMaps;
  // }

  // /**
  //  * Parse the provided Condition Map and prepare it for storage, validating and correcting bad or missing data where possible
  //  * @param {*} conditionMap
  //  */
  //  _prepareMap(conditionMap) {
  //     if (!conditionMap || !conditionMap?.length) return;

  //     const preparedMap = [];
  //     const outputChatSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);

  //     // Map existing ids for ease of access
  //     const existingIds = conditionMap.filter(c => c.id).map(c => c.id);

  //     // Iterate through the map validating/preparing the data
  //     for (let i = 0; i < conditionMap.length; i++) {
  //         let condition = duplicateExtended(conditionMap[i]);

  //         // Delete falsy values
  //         if (!condition) preparedMap.splice(i, 1);

  //         // Convert string values (eg. icon path) to condition/effect object
  //         // @todo #580 Consider re-adding support for systems that use simple icons for status effects
  //         //condition = typeof condition == "string" ? {icon: condition} : condition;
  //         if (typeof condition == "string") continue;

  //         if (!condition.name) {
  //             condition.name = condition.label ?? (condition.icon ? Sidekick.getNameFromFilePath(condition.icon) : "");
  //         }
  //         condition.id = condition.id || Sidekick.generateUniqueSlugId(condition.name, existingIds);
  //         condition.options = condition.options || {};
  //         if (condition.options.outputChat === undefined) condition.options.outputChat = outputChatSetting;
  //         preparedMap.push(condition);
  //     }

  //     return preparedMap;
  // }

  // /**
  //  * Duplicate the core status icons, freeze the duplicate then store a copy in settings
  //  */
  //  _backupCoreEffects() {
  //     CONFIG.defaultStatusEffects = CONFIG.defaultStatusEffects || duplicateExtended(CONFIG.statusEffects);
  //     if (!Object.isFrozen(CONFIG.defaultStatusEffects)) {
  //         Object.freeze(CONFIG.defaultStatusEffects);
  //     }
  //     Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects, CONFIG.defaultStatusEffects);
  // }

  // /**
  //  * Creates journal entries for any conditions that don't have one
  //  * @param {String} condition - the condition being evaluated
  //  */
  //  async _createJournalEntry(condition) {
  //     let entry = null;

  //     try {
  //         entry = await JournalEntry.create({
  //             name: condition,
  //             permission: {
  //                 default: CONST.ENTITY_PERMISSIONS.LIMITED
  //             }
  //         }, {
  //             displaySheet: false
  //         });
  //     } catch (e) {
  //         //console.log(e);
  //     } finally {
  //         return entry;
  //     }

  // }

  // /**
  //  * Gets one or more conditions from the map by their name
  //  * @param {String} conditionName  the condition to get
  //  * @param {Array} map  the condition map to search
  //  */
  //  _lookupConditionByName(conditionName, map=null) {
  //     if (!conditionName) return;

  //     conditionName = conditionName instanceof Array ? conditionName : [conditionName];

  //     if (!map) map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

  //     const conditions = map.filter(c => conditionName.includes(c.name)) ?? [];

  //     if (!conditions.length) return null;

  //     return conditions.length > 1 ? conditions : conditions.shift();
  // }

  // /**
  //  * Updates the CONFIG.statusEffect effects with Condition Map ones
  //  * @param {*} conditionMap
  //  */
  //  _updateStatusEffects(conditionMap) {
  //     const enable = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable);

  //     if (!enable) {
  //         // maybe restore the core icons?
  //         return;
  //     }

  //     let entries;
  //     const coreEffectsSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects);

  //     //save the original icons
  //     if (!coreEffectsSetting.length) {
  //         EnhancedConditions._backupCoreEffects();
  //     }

  //     const removeDefaultEffects = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.removeDefaultEffects);
  //     const activeConditionMap = conditionMap || Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

  //     if (!removeDefaultEffects && !activeConditionMap) {
  //         return;
  //     }

  //     const activeConditionEffects = EnhancedConditions._prepareStatusEffects(activeConditionMap);

  //     if (removeDefaultEffects) {
  //         return CONFIG.statusEffects = activeConditionEffects ?? [];
  //     }

  //     if (activeConditionMap instanceof Array) {
  //         //add the icons from the condition map to the status effects array
  //         const coreEffects = CONFIG.defaultStatusEffects || Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects);

  //         // Create a Set based on the core status effects and the Enhanced Condition effects. Using a Set ensures unique icons only
  //         return CONFIG.statusEffects = coreEffects.concat(activeConditionEffects);
  //     }
  // }

  // /**
  //  * Converts the given Condition Map (one or more Conditions) into a Status Effects array or object
  //  * @param {Array | Object} conditionMap
  //  * @returns {Array} statusEffects
  //  */
  //  _prepareStatusEffects(conditionMap) {
  //     conditionMap = conditionMap instanceof Array ? conditionMap : [conditionMap];

  //     if (!conditionMap.length) return;

  //     const statusEffects = conditionMap.map((c, i, a) => {
  //         const existingIds = a.length ? a.filter(c => c.id).map(c => c.id) : [];
  //         const id = c.id ? `${BUTLER.NAME}.${c.id}` : Sidekick.generateUniqueSlugId(c.name, existingIds);

  //         return {
  //             id,
  //             flags: {
  //                 ...c.activeEffect?.flags,
  //                 core: {
  //                     statusId: `${[BUTLER.NAME]}.${c.id}` ?? `${[BUTLER.NAME]}.${c.name?.slugify()}`
  //                 },
  //                 [BUTLER.NAME]: {
  //                     [BUTLER.FLAGS.enhancedConditions.conditionId]: c.id ?? c.name?.slugify(),
  //                     [BUTLER.FLAGS.enhancedConditions.overlay]: c?.options?.overlay ?? false
  //                 }
  //             },
  //             label: c.name,
  //             icon: c.icon,
  //             changes: c.activeEffect?.changes || [],
  //             duration: c.duration || c.activeEffect?.duration || {}
  //         }
  //     });

  //     return statusEffects.length > 1 ? statusEffects : statusEffects.shift();
  // }

  // /**
  //  * Prepares one or more ActiveEffects from Conditions for placement on an actor
  //  * @param {Object | Array} effects  a single ActiveEffect data object or an array of ActiveEffect data objects
  //  */
  //  _prepareActiveEffects(effects) {
  //     if (!effects) return;

  //     for (const effect of effects) {
  //         const overlay = getProperty(effect, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.overlay}`);
  //         // If the parent Condition for the ActiveEffect defines it as an overlay, mark the ActiveEffect as an overlay
  //         if (overlay) {
  //             effect.flags.core.overlay = overlay;
  //         }
  //     }

  //     return effects;
  // }

  // /**
  //  * Returns just the icon side of the map
  //  */
  //  getConditionIcons(conditionMap={}) {
  //     if (!conditionMap) {
  //         //maybe log an error?
  //         return;
  //     }

  //     if (Object.keys(conditionMap).length === 0) {
  //         conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

  //         if (!conditionMap || Object.keys(conditionMap).length === 0) {
  //             return [];
  //         }
  //     }

  //     if (conditionMap instanceof Array) {
  //         return conditionMap.map(mapEntry => mapEntry.icon);
  //     }

  //     return [];
  // }

  // /**
  //  * Retrieves a condition icon by its mapped name
  //  * @param {*} condition
  //  */
  //  getIconsByCondition(condition, {firstOnly=false}={}) {
  //     const conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

  //     if (!conditionMap || !condition) {
  //         return;
  //     }

  //     if (conditionMap instanceof Array) {
  //         const filteredConditions = conditionMap.filter(c => c.name === condition).map(c => c.icon);
  //         if (!filteredConditions.length) {
  //             return;
  //         }

  //         return firstOnly ? filteredConditions[0] : filteredConditions;
  //     }

  //     return null;
  // }

  // /**
  //  * Retrieves a condition name by its mapped icon
  //  * @param {*} icon
  //  */
  //  getConditionsByIcon(icon, {firstOnly=false}={}) {
  //     const conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

  //     if (!conditionMap || !icon) {
  //         return;
  //     }

  //     if (conditionMap instanceof Array && conditionMap.length) {
  //         const filteredIcons = conditionMap.filter(c => c.icon === icon).map(c => c.name);
  //         if (!filteredIcons.length) {
  //             return null;
  //         }
  //         return firstOnly ? filteredIcons[0] : filteredIcons;
  //     }

  //     return null;
  // }

  // /**
  //  * Parses a condition map JSON and returns a map
  //  * @param {*} json
  //  */
  //  mapFromJson(json) {
  //     if (json.system !== game.system.id) {
  //         ui.notifications.warn(game.i18n.localize("ENHANCED_CONDITIONS.MapMismatch"));
  //     }

  //     const map = json.map ? EnhancedConditions._prepareMap(json.map) : [];

  //     return map;
  // }

  // /**
  //  * Returns the default condition map for a given system
  //  * @param {*} system
  //  */
  //  getDefaultMap(system, defaultMaps=null) {
  //     defaultMaps = defaultMaps instanceof Object ? defaultMaps : Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMaps);
  //     let defaultMap = defaultMaps[system] || [];

  //     if (!defaultMap.length) {
  //         defaultMap = EnhancedConditions.buildDefaultMap(system);
  //     }

  //     return defaultMap;
  // }

  // /**
  //  * Builds a default map for a given system
  //  * @param {*} system
  //  * @todo #281 update for active effects
  //  */
  //  buildDefaultMap(system) {
  //     const coreEffectsSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects)
  //     const coreEffects = (coreEffectsSetting && coreEffectsSetting.length) ? coreEffectsSetting : CONFIG.statusEffects;
  //     const map = EnhancedConditions._prepareMap(coreEffects);

  //     return map;
  // }

  // /**
  //  * Create a dialog reminding users to Save the Condition Lab as a preventation for issues arising from the transition to Active Effects
  //  */
  //  async _preventativeSaveReminder() {
  //     const content = await renderTemplate(`${BUTLER.PATH}/templates/preventative-save-dialog.hbs`);

  //     const dialog = new Dialog({
  //         title: game.i18n.localize("ENHANCED_CONDITIONS.PreventativeSaveReminder.Title"),
  //         content,
  //         buttons: {
  //             ok: {
  //                 label: game.i18n.localize("WORDS.IUnderstand"),
  //                 icon: `<i class="fas fa-check"></i>`,
  //                 callback: (html, event) => {
  //                     const suppressCheckbox = html.find("input[name='suppress']");
  //                     const suppress = suppressCheckbox.val();
  //                     if (suppress) {
  //                         Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.suppressPreventativeSaveReminder, true)
  //                     }
  //                 }
  //             }
  //         }
  //     });

  //     dialog.render(true);
  // }

  /* -------------------------------------------- */
  /*                      API                     */
  /* -------------------------------------------- */

  /**
   * Applies the named condition to the provided entities (Actors or Tokens)
   * @param {String[] | String} conditionName  the name of the condition to add
   * @param {(Actor[] | Token[] | Actor | Token)} [entities=null] one or more Actors or Tokens to apply the Condition to
   * @param {Boolean} [options.warn=true]  raise warnings on errors
   * @param {Boolean} [options.allowDuplicates=false]  if one or more of the Conditions specified is already active on the Entity, this will still add the Condition. Use in conjunction with `replaceExisting` to determine how duplicates are handled
   * @param {Boolean} [options.replaceExisting=false]  whether or not to replace existing Conditions with any duplicates in the `conditionName` parameter. If `allowDuplicates` is true and `replaceExisting` is false then a duplicate condition is created. Has no effect is `keepDuplicates` is `false`
   * @example
   * // Add the Condition "Blinded" to an Actor named "Bob". Duplicates will not be created.
   * game.cub.addCondition("Blinded", game.actors.getName("Bob"));
   * @example
   * // Add the Condition "Charmed" to the currently controlled Token/s. Duplicates will not be created.
   * game.cub.addCondition("Charmed");
   * @example
   * // Add the Conditions "Blinded" and "Charmed" to the targeted Token/s and create duplicates, replacing any existing Conditions of the same names.
   * game.cub.addCondition(["Blinded", "Charmed"], [...game.user.targets], {allowDuplicates: true, replaceExisting: true});
   */
  addCondition(
    conditionName,
    entities: Actor[] | Token[] | Actor | Token,
    { warn, allowDuplicates, replaceExisting },
  ): Promise<void>;

  /**
   * Gets a condition by name from the Condition Map
   * @param {*} conditionName
   * @param {*} map
   * @param {*} options.warn
   */
  getCondition(conditionName, map, { warn }): any;

  /**
   * Retrieves all active conditions for one or more given entities (Actors or Tokens)
   * @param {Actor | Token} entities  one or more Actors or Tokens to get Conditions from
   * @param {Boolean} options.warn  output notifications
   * @returns {Array} entityConditionMap  a mapping of conditions for each provided entity
   * @example
   * // Get conditions for an Actor named "Bob"
   * game.cub.getConditions(game.actors.getName("Bob"));
   * @example
   * // Get conditions for the currently controlled Token
   * game.cub.getConditions();
   */
  getConditions(entities: Actor[] | Token[], { warn }): any[];

  /**
   * Gets the Active Effect data (if any) for the given condition
   * @param {*} condition
   */
  getActiveEffect(condition): Array<any> | Object | null;

  /**
   * Gets any Active Effect instances present on the entities (Actor/s or Token/s) that are mapped Conditions
   * @param {String} entities  the entities to check
   * @param {Array} map  the Condition map to check (optional)
   * @param {Boolean} warn  output notifications
   * @returns {Map | Object} A Map containing the Actor Id and the Condition Active Effect instances if any
   */
  getConditionEffects(entities, map: any[], { warn }): Map<string, any> | Array<any> | null;

  /**
   * Checks if the provided Entity (Actor or Token) has the given condition
   * @param {String | Array} conditionName  the name/s of the condition or conditions to check for
   * @param {Actor | Token | Array} entities  the entity or entities to check (Actor/s or Token/s)
   * @param {Boolean} options.warn  output notifications
   * @returns {Boolean} hasCondition  Returns true if one or more of the provided entities has one or more of the provided conditions
   * @example
   * // Check for the "Blinded" condition on Actor "Bob"
   * game.cub.hasCondition("Blinded", game.actors.getName("Bob"));
   * @example
   * // Check for the "Charmed" and "Deafened" conditions on the controlled tokens
   * game.cub.hasCondition(["Charmed", "Deafened"]);
   */
  hasCondition(conditionName, entities: Actor[] | Token[] | Actor | Token, { warn }): boolean;

  /**
   * Removes one or more named conditions from an Entity (Actor/Token)
   * @param {Actor | Token} entities  One or more Actors or Tokens
   * @param {String} conditionName  the name of the Condition to remove
   * @param {Object} options  options for removal
   * @param {Boolean} options.warn  whether or not to raise warnings on errors
   * @example
   * // Remove Condition named "Blinded" from an Actor named Bob
   * game.cub.removeConditions("Blinded", game.actors.getName("Bob"));
   * @example
   * // Remove Condition named "Charmed" from the currently controlled Token, but don't show any warnings if it fails.
   * game.cub.removeConditions("Charmed", {warn=false});
   */
  removeCondition(conditionName, entities: Actor | Token, { warn }): Promise<void>;

  /**
   * Removes all conditions from the provided entities
   * @param {Actors | Tokens} entities  One or more Actors or Tokens to remove Conditions from
   * @param {Boolean} options.warn  output notifications
   * @example
   * // Remove all Conditions on an Actor named Bob
   * game.cub.removeAllConditions(game.actors.getName("Bob"));
   * @example
   * // Remove all Conditions on the currently controlled Token
   * game.cub.removeAllConditions();
   */
  removeAllConditions(entities: Actor[] | Token[], { warn }): Promise<void>;
}
