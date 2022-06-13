// ↓ IMPORT SYSTEMS HERE ↓
import dnd5e from './systems/dnd5e';
import pf1 from './systems/pf1';
import pf2e from './systems/pf2e';
import generic from './systems/generic';

// ↑ IMPORT SYSTEMS HERE ↑

/**
 * NOTE: YOUR PULL REQUEST WILL NOT BE ACCEPTED IF YOU DO NOT
 * FOLLOW THE CONVENTION IN THE D&D 5E SYSTEM FILE
 */
export const SYSTEMS = {
  get DATA() {
    return {
      // ↓ ADD SYSTEMS HERE ↓
      dnd5e,
      pf1,
      pf2e,
      generic,
      // ↑ ADD SYSTEMS HERE ↑
    }?.[game.system.id];
  },
};
