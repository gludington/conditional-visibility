import { ConditionalVisibilityFacade } from '../ConditionalVisibilityFacade';
import { StatusEffect } from '../settings';

/**
 * A ConditionalVisibilitySystem abstracts the parameters that would be specific to a game system, e.g. dnd5e might use stealth
 * and passive perception, whereas starfinder may use another setup.
 */
export interface ConditionalVisibilitySystem {
  /**
   * The game system id this visiblity system should be used for
   */
  gameSystemId(): string;

  /**
   * A map of icon urls to a condition name. Effectively a BiMap with effectsByCondition()
   */
  effectsByIcon(): Map<string, StatusEffect>;

  /**
   * A map of condition names to icon urls.  Effectively a BiMap with effects()
   */
  effectsByCondition(): Map<string, StatusEffect>;

  /**
   *  Process the creation of an active effect
   */
  onCreateEffect(data, options, userId);
  /**
   *  Process the removal of an active effect
   */
  onDeleteEffect(data, options, userId);

  /**
   * Get an effect by icon - pf2e uses a string, not a StatusEffect
   */
  getEffectByIcon(effect: StatusEffect | string): StatusEffect;

  effectsFromUpdate(update: any): any;

  /**
   * Initizialize status effects for the system.
   */
  initializeStatusEffects(): void;

  /**
   * Initialize system-specific hooks.
   * @param facade the window-scoped object for a public api
   * @todo clean this up and hide
   */
  initializeHooks(facade: ConditionalVisibilityFacade): void;

  /**
   * Get the vision capabilities of the combined list of tokens provided.
   * @param srcToken
   * @return an object containing flags for conditions that will be passed to canSee
   */
  getVisionCapabilities(srcToken: Array<Token> | Token): any;

  /**
   * Check to see if a target token can be seen by an object containing sight capabilities.
   * @param target the token to be seen
   * @param visionCapabilities the capabilities of the observing sightLayer
   * @returns true if the token can be seen on the sightLayer, false otherwise
   */
  canSee(target: Token, visionCapabilities: any): boolean;

  /**
   * Initialize any behaviors to occur when an effect is toggled.
   * @param tokenHud the tokenHud where the effects are toggled
   */
  initializeOnToggleEffect(tokenHud: any): void;

  /**
   * Returns true if the system supports the "hidden" condition and provides a means to roll dice, false otherwise.
   */
  hasStealth(): boolean;

  /**
   * Rolls stealth appropriate to the token, for those systems that support stealth
   * @param token
   */
  rollStealth(token: Token): any;
}
