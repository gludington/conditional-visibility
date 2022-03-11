import CONSTANTS from './constants';
import { registerHotkeys } from './hotkeys';
import { debug, isGMConnected } from './lib/lib';
import { registerLibwrappers } from './libwrapper';
import { checkSystem } from './settings';
import { canvas, game } from './settings';
import { registerSocket } from './socket';
import API from './api';

const prefix =
  (str) =>
  (strs, ...exprs) =>
    `${str}-${strs.reduce((a, c, i) => a + exprs[i - 1] + c)}`;
const module = prefix(CONSTANTS.MODULE_NAME);

const HOOKS = {
  READY: module`ready`,
  ON_RENDER_TOKEN_CONFIG: module`onRenderTokenConfig`,
};

export default HOOKS;
