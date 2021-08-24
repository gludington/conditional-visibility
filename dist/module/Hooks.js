import { log, warn } from "../conditional-visibility.js";
import { ConditionalVisibility } from "./ConditionalVisibility.js";
import { getGame, getCanvas, MODULE_NAME } from "./settings.js";
export const readyHooks = async () => {
    // setup all the hooks
    log(' Ready ' + MODULE_NAME);
    const sightLayer = getCanvas().layers.find((layer) => {
        switch (getGame().system.id) {
            case 'dnd5e':
                //@ts-ignore
                return layer.__proto__.constructor.name === 'SightLayer';
                break;
            case 'pf2e':
                //@ts-ignore
                return layer.__proto__.constructor.name === 'SightLayerPF2e';
                break;
            default:
                //@ts-ignore
                return layer.__proto__.constructor.name === 'SightLayer';
        }
    });
    ConditionalVisibility.initialize(sightLayer, getCanvas().hud?.token);
    // Add any additional hooks if necessary
    Hooks.on('renderTokenConfig', (tokenConfig, html, data) => {
        ConditionalVisibility.INSTANCE.onRenderTokenConfig(tokenConfig, html, data);
    });
    Hooks.on('renderTokenHUD', (app, html, token) => {
        ConditionalVisibility.INSTANCE.onRenderTokenHUD(app, html, token);
    });
    Hooks.on('sightRefresh', () => {
        ConditionalVisibility.INSTANCE.restrictVisibility(32);
    });
    //synthetic actors go through this
    // Hooks.on("preUpdateToken", ( token, update, options, userId) => {
    //     ConditionalVisibility.INSTANCE.onUpdateToken( token, update, options, userId);
    // });
    //real actors go through this
    Hooks.on('updateToken', (token, updates) => {
        if ('elevation' in updates || 'x' in updates || 'y' in updates || 'rotation' in updates) {
            ConditionalVisibility.INSTANCE.restrictVisibility(100);
            //token._object.visible = ConditionalVisibility.canSee(token._object);
        }
    });
    Hooks.on('createActiveEffect', (effect, options, userId) => {
        ConditionalVisibility.INSTANCE.onCreateEffect(effect, options, userId);
    });
    Hooks.on('deleteActiveEffect', (effect, options, userId) => {
        ConditionalVisibility.INSTANCE.onDeleteEffect(effect, options, userId);
    });
    Hooks.on('createItem', (effect, options, userId) => {
        ConditionalVisibility.INSTANCE.onCreateEffect(effect, options, userId);
    });
    Hooks.on('deleteItem', (effect, options, userId) => {
        ConditionalVisibility.INSTANCE.onDeleteEffect(effect, options, userId);
    });
};
export const initHooks = () => {
    warn('Init Hooks processing');
};
