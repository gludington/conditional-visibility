import { ConditionalVisibility } from "./ConditionalVisibility";
import { getCanvas, MODULE_NAME } from "./settings";

export let readyHooks = async () => {

  // setup all the hooks
  console.log(MODULE_NAME + ' | Ready ' + MODULE_NAME);
  const sightLayer = <SightLayer>getCanvas().layers.find(layer => {
      //@ts-ignore
      return layer.__proto__.constructor.name === 'SightLayer'
  });

  ConditionalVisibility.initialize(sightLayer, getCanvas().hud.token);

  // Add any additional hooks if necessary
  Hooks.on("renderTokenConfig", (tokenConfig, html, data) => {
    ConditionalVisibility.INSTANCE.onRenderTokenConfig(tokenConfig, html, data);
  });

  Hooks.on("renderTokenHUD", (app, html, data) => {
    ConditionalVisibility.INSTANCE.onRenderTokenHUD(app, html, data);
  });

  //synthetic actors go through this
  Hooks.on("preUpdateToken", (scene, token, update, options, userId) => {
    ConditionalVisibility.INSTANCE.onPreUpdateToken(scene, token, update, options, userId);
  })

  //real actors go through this
  Hooks.on("preCreateActiveEffect", (actor, effect, options, userId) => {
    ConditionalVisibility.INSTANCE.onPreCreateActiveEffect(actor, effect, options, userId);
  })

  Hooks.on("preDeleteActiveEffect", (actor, effect, options, userId) => {
    ConditionalVisibility.INSTANCE.onPreDeleteActiveEffect(actor, effect, options, userId);
  })
}

export let initHooks = () => {
  console.warn("Init Hooks processing");

}
