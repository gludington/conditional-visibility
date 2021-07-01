import { ConditionalVisibility } from "./ConditionalVisibility";
import { getCanvas, MODULE_NAME } from "./settings";

export let readyHooks = async () => {

    // setup all the hooks
    console.log(MODULE_NAME + ' | Ready ' + MODULE_NAME);
    const sightLayer = getCanvas().layers.find(layer => {
        //@ts-ignore
        return layer.__proto__.constructor.name === 'SightLayer';
    });

    ConditionalVisibility.initialize(sightLayer, getCanvas().hud.token);

    // Add any additional hooks if necessary
    Hooks.on("renderTokenConfig", (tokenConfig, html, data) => {
        ConditionalVisibility.INSTANCE.onRenderTokenConfig(tokenConfig, html, data);
    });
    Hooks.on("renderTokenHUD", (app, html, token) => {
        ConditionalVisibility.INSTANCE.onRenderTokenHUD(app, html, token);
    });

    //synthetic actors go through this
    // Hooks.on("preUpdateToken", ( token, update, options, userId) => {
    //     ConditionalVisibility.INSTANCE.onUpdateToken( token, update, options, userId);
    // });
    //real actors go through this
    Hooks.on("createActiveEffect", (effect, options, userId) => {
        ConditionalVisibility.INSTANCE.onCreateEffect(effect, options, userId);
    });

    Hooks.on("deleteActiveEffect", (effect, options, userId) => {
        ConditionalVisibility.INSTANCE.onDeleteEffect(effect, options, userId);
    });
    
    Hooks.on("createItem", (effect, options, userId) => {
        ConditionalVisibility.INSTANCE.onCreateEffect(effect, options, userId);
    });

    Hooks.on("deleteItem", (effect, options, userId) => {
        ConditionalVisibility.INSTANCE.onDeleteEffect(effect, options, userId);
    });
}

export let initHooks = () => {
  console.warn("Init Hooks processing");

}
