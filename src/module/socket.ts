import CONSTANTS from './constants';
import API from './api';
import { debug } from './lib/lib';
import { setSocket } from '../conditional-visibility';

export const SOCKET_HANDLERS = {
  /**
   * Generic sockets
   */
  CALL_HOOK: 'callHook',
  ON_RENDER_TOKEN_CONFIG: 'onRenderTokenConfig',

  /**
   * Item pile sockets
   */

  /**
   * UI sockets
   */

  /**
   * Item & attribute sockets
   */
};

export let conditionalVisibilitySocket;

export function registerSocket() {
  debug('Registered conditionalVisibilitySocket');
  if (conditionalVisibilitySocket) {
    return conditionalVisibilitySocket;
  }
  //@ts-ignore
  conditionalVisibilitySocket = socketlib.registerModule(CONSTANTS.MODULE_NAME);

  /**
   * Generic socket
   */
  conditionalVisibilitySocket.register(SOCKET_HANDLERS.CALL_HOOK, (hook, ...args) => callHook(hook, ...args));

  // /**
  //  * Conditional Visibility sockets
  //  */
  // conditionalVisibilitySocket.register(SOCKET_HANDLERS.ON_RENDER_TOKEN_CONFIG, (...args) =>
  //   API._onRenderTokenConfig(...args),
  // );
  conditionalVisibilitySocket.register('prepareActiveEffectForConditionalVisibility', (...args) =>
    API.prepareActiveEffectForConditionalVisibilityArr(...args),
  );
  conditionalVisibilitySocket.register('updateSourceCV', (...args) => API.updateSourceCVArr(...args));
  conditionalVisibilitySocket.register('sightRefreshCV', (...args) => API.sightRefreshCVArr(...args));
  conditionalVisibilitySocket.register('drawImageByUserCV', (...args) => API.drawImageByUserCVArr(...args));
  conditionalVisibilitySocket.register('renderAutoSkillsDialogCV', (...args) =>
    API.renderAutoSkillsDialogCVArr(...args),
  );
  /**
   * UI sockets
   */

  /**
   * Item & attribute sockets
   */

  /**
   * Effects
   */

  // Basic

  // conditionalVisibilitySocket.register('addActorDataChanges', (...args) => API._actorUpdater.addActorDataChanges(...args));
  // conditionalVisibilitySocket.register('removeActorDataChanges', (...args) => API._actorUpdater.removeActorDataChanges(...args));
  conditionalVisibilitySocket.register('toggleEffect', (...args) => API.toggleEffectArr(...args));
  conditionalVisibilitySocket.register('hasEffectApplied', (...args) => API.hasEffectAppliedArr(...args));
  conditionalVisibilitySocket.register('addEffect', (...args) => API.addEffectArr(...args));
  conditionalVisibilitySocket.register('removeEffect', (...args) => API.removeEffectArr(...args));

  // Actor

  // conditionalVisibilitySocket.register('toggleEffectFromIdOnActor', (...args) =>
  //   API.toggleEffectFromIdOnActorArr(...args),
  // );
  // conditionalVisibilitySocket.register('hasEffectAppliedOnActor', (...args) => API.hasEffectAppliedOnActorArr(...args));
  // conditionalVisibilitySocket.register('hasEffectAppliedFromIdOnActor', (...args) =>
  //   API.hasEffectAppliedFromIdOnActorArr(...args),
  // );
  // conditionalVisibilitySocket.register('addEffectOnActor', (...args) => API.addEffectOnActorArr(...args));
  // conditionalVisibilitySocket.register('removeEffectOnActor', (...args) => API.removeEffectOnActorArr(...args));
  // conditionalVisibilitySocket.register('removeEffectFromIdOnActor', (...args) =>
  //   API.removeEffectFromIdOnActorArr(...args),
  // );
  // conditionalVisibilitySocket.register('findEffectByNameOnActor', (...args) => API.findEffectByNameOnActorArr(...args));

  // Token

  conditionalVisibilitySocket.register('toggleEffectFromIdOnToken', (...args) =>
    API.toggleEffectFromIdOnTokenArr(...args),
  );
  conditionalVisibilitySocket.register('hasEffectAppliedFromIdOnToken', (...args) =>
    API.hasEffectAppliedFromIdOnTokenArr(...args),
  );
  conditionalVisibilitySocket.register('hasEffectAppliedOnToken', (...args) => API.hasEffectAppliedOnTokenArr(...args));
  conditionalVisibilitySocket.register('addEffectOnToken', (...args) => API.addEffectOnTokenArr(...args));
  conditionalVisibilitySocket.register('removeEffectOnToken', (...args) => API.removeEffectOnTokenArr(...args));
  conditionalVisibilitySocket.register('removeEffectFromIdOnToken', (...args) =>
    API.removeEffectFromIdOnTokenArr(...args),
  );
  conditionalVisibilitySocket.register('removeEffectFromIdOnTokenMultiple', (...args) =>
    API.removeEffectFromIdOnTokenMultipleArr(...args),
  );
  conditionalVisibilitySocket.register('findEffectByNameOnToken', (...args) => API.findEffectByNameOnTokenArr(...args));
  conditionalVisibilitySocket.register('updateEffectFromIdOnToken', (...args) =>
    API.updateEffectFromIdOnTokenArr(...args),
  );
  conditionalVisibilitySocket.register('updateEffectFromNameOnToken', (...args) =>
    API.updateEffectFromNameOnTokenArr(...args),
  );
  conditionalVisibilitySocket.register('updateActiveEffectFromIdOnToken', (...args) =>
    API.updateActiveEffectFromIdOnTokenArr(...args),
  );
  conditionalVisibilitySocket.register('updateActiveEffectFromNameOnToken', (...args) =>
    API.updateActiveEffectFromNameOnTokenArr(...args),
  );
  setSocket(conditionalVisibilitySocket);
  return conditionalVisibilitySocket;
}

async function callHook(inHookName, ...args) {
  const newArgs: any[] = [];
  for (let arg of args) {
    if (typeof arg === 'string') {
      const testArg = await fromUuid(arg);
      if (testArg) {
        arg = testArg;
      }
    }
    newArgs.push(arg);
  }
  return Hooks.callAll(inHookName, ...newArgs);
}
