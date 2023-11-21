import {
  Dimensions,
  StyleSheet as RNStyleSheet,
  Appearance,
} from "react-native";

import { CommonStyleSheet } from "../../types";
import { vh, vw } from "./misc";
import { INTERNAL_FLAGS as INTERNAL_FLAGS, INTERNAL_RESET } from "../../shared";
import { colorScheme } from "./color-scheme";
import { createColorSchemeSignal, globalVariables } from "./inheritance";
import {
  animationMap,
  styleSignals,
  upsertStyleSignal,
  warned,
  warnings,
} from "./style";

const commonStyleSheet: CommonStyleSheet = {
  [INTERNAL_FLAGS]: {},
  [INTERNAL_RESET]({ dimensions = Dimensions, appearance = Appearance } = {}) {
    animationMap.clear();
    warnings.clear();
    warned.clear();
    globalVariables.rem.set(14);
    styleSignals.clear();
    vw[INTERNAL_RESET](dimensions);
    vh[INTERNAL_RESET](dimensions);
    colorScheme[INTERNAL_RESET](appearance);
  },
  getFlag(name) {
    return this[INTERNAL_FLAGS][name];
  },
  unstable_hook_onClassName() {},
  register() {
    throw new Error("Stylesheet.register is not yet implemented");
  },
  registerCompiled(options) {
    // console.log(JSON.stringify(options, null, 2));
    this[INTERNAL_FLAGS]["$$receivedData"] = "true";
    if (options.flags) {
      Object.assign(this[INTERNAL_FLAGS], options.flags);
    }

    if (options.keyframes) {
      for (const [name, keyframes] of Object.entries(options.keyframes)) {
        animationMap.set(name, keyframes);
      }
    }

    if (options.declarations) {
      for (let [name, styles] of options.declarations) {
        upsertStyleSignal(name, styles);
      }
    }

    if (options.rootVariables) {
      for (const [name, value] of Object.entries(options.rootVariables)) {
        let signal = globalVariables.root.get(name);
        if (!signal) {
          signal = createColorSchemeSignal(`root:${name}`);
          globalVariables.root.set(name, signal);
        }
        signal.set(value);
      }
    }

    if (options.universalVariables) {
      for (const [name, value] of Object.entries(options.universalVariables)) {
        let signal = globalVariables.universal.get(name);
        if (!signal) {
          signal = createColorSchemeSignal(`root:${name}`);
          globalVariables.universal.set(name, signal);
        }
        signal.set(value);
      }
    }

    if (options.rem) {
      globalVariables.rem.set(options.rem);
    }
  },
};

export const StyleSheet = Object.assign({}, commonStyleSheet, RNStyleSheet);
