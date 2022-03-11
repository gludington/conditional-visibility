import CONSTANTS from './constants';
import API from './api';
import { debug } from './lib/lib';

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
  if(conditionalVisibilitySocket){
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

  /**
   * UI sockets
   */

  /**
   * Item & attribute sockets
   */

  /**
   * Effects
   */

  // conditionalVisibilitySocket.register('addActorDataChanges', (...args) => API._actorUpdater.addActorDataChanges(...args));
  // conditionalVisibilitySocket.register('removeActorDataChanges', (...args) => API._actorUpdater.removeActorDataChanges(...args));
  conditionalVisibilitySocket.register('toggleEffect', (...args) => API.toggleEffectArr(...args));
  conditionalVisibilitySocket.register('addEffect', (...args) => API.addEffectArr(...args));
  conditionalVisibilitySocket.register('removeEffect', (...args) => API.removeEffectArr(...args));

  conditionalVisibilitySocket.register('addEffectOnActor', (...args) => API.addEffectOnActorArr(...args));
  conditionalVisibilitySocket.register('removeEffectOnActor', (...args) => API.removeEffectOnActorArr(...args));
  conditionalVisibilitySocket.register('removeEffectFromIdOnActor', (...args) =>
    API.removeEffectFromIdOnActorArr(...args),
  );
  conditionalVisibilitySocket.register('toggleEffectFromIdOnActor', (...args) =>
    API.toggleEffectFromIdOnActorArr(...args),
  );
  conditionalVisibilitySocket.register('findEffectByNameOnActor', (...args) => API.findEffectByNameOnActorArr(...args));

  conditionalVisibilitySocket.register('addEffectOnToken', (...args) => API.addEffectOnTokenArr(...args));
  conditionalVisibilitySocket.register('removeEffectOnToken', (...args) => API.removeEffectOnTokenArr(...args));
  conditionalVisibilitySocket.register('removeEffectFromIdOnToken', (...args) =>
    API.removeEffectFromIdOnTokenArr(...args),
  );
  conditionalVisibilitySocket.register('toggleEffectFromIdOnToken', (...args) =>
    API.toggleEffectFromIdOnTokenArr(...args),
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
