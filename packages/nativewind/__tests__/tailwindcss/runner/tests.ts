import { ColorValue } from "react-native";
import { Test } from ".";
import { Style, StyleRecord } from "../../../src/types/common";
import { normalizeCssSelector } from "../../../src/utils/selector";

export function expectError(names: string[]): Test[] {
  return names.map((name) => [name, {}, true]);
}

export function createTests<T extends string | number | ColorValue | undefined>(
  prefix: string,
  suffixes: Record<string, T>,
  valueFunction: (n: T, suffix: string) => Style
): Test[] {
  return Object.entries(suffixes).map(([suffix, value]) => {
    const styles: StyleRecord = {};

    // If the suffix is a decimal 0.5, the tailwind compiler will generate styles for
    // both 0.5 and 0
    //
    // This is true for all decimal numbers
    const scaleParsed = Number(suffix.toString());
    const flooredNumber = Math.floor(scaleParsed);

    if (Number.isFinite(flooredNumber) && flooredNumber !== scaleParsed) {
      const key = `${prefix}-${flooredNumber}`;
      const result = valueFunction(
        suffixes[flooredNumber],
        flooredNumber.toString()
      );

      styles[normalizeCssSelector(key)] = result;
    }

    const key = suffix ? `${prefix}-${suffix}` : prefix;

    const result = valueFunction(value, suffix);

    styles[normalizeCssSelector(key)] = result;

    return [key, { styles }];
  });
}
