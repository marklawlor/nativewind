import {
  ComponentType,
  PropsWithChildren,
  ReactNode,
  createElement,
  forwardRef,
} from "react";
import type {
  BasicInteropFunction,
  EnableCssInteropOptions,
  InteropFunction,
  JSXFunction,
} from "../types";
import { defaultInteropRef } from "./globals";
import { getNormalizeConfig } from "./native/prop-mapping";
import { interopGlobal } from "./signals";
import { opaqueStyles } from "./native/globals";

export type InteropTypeCheck<T> = {
  type: ComponentType<T>;
  check: (props: T) => boolean;
  createElementWithInterop: (
    props: any,
    children: ReactNode,
  ) => ReturnType<typeof createElement>;
};
export const interopComponents = new Map<
  object | string,
  InteropTypeCheck<any>
>();

export function render<P>(
  jsx: JSXFunction<P>,
  type: any,
  props: any,
  ...args: Parameters<JSXFunction<P>> extends [any, any, ...infer R] ? R : never
) {
  if (process.env.NODE_ENV === "development") {
    if (type === "react-native-css-interop-jsx-pragma-check") {
      return true;
    }
  }

  // TODO: Try and add this back
  // if (
  //   typeof type === "string" &&
  //   Platform.OS !== "web" &&
  //   !interopComponents.has(type)
  // ) {
  //   cssInterop(type, { className: "style" });
  // }

  const interop = interopComponents.get(type) as
    | InteropTypeCheck<P>
    | undefined;

  if (!interop || !interop.check(props)) return jsx(type, props, ...args);

  return jsx(interop.type, props, ...args);
}

export function renderWithInterop<P>(
  jsx: JSXFunction<P>,
  interop: BasicInteropFunction,
  ...args: Parameters<JSXFunction<P>>
) {
  return interop(jsx, ...args);
}

export function createElementAndCheckCssInterop(
  ...args: Parameters<typeof createElement>
) {
  const type = args[0];

  if (!type) return createElement(...args);

  const interop = interopComponents.get(type as object);

  return !interop || !interop.check(args[1])
    ? createElement(...args)
    : interop.createElementWithInterop(args[1], args.slice(2) as ReactNode);
}

export function cssInterop<T extends {}, M>(
  component: ComponentType<T> | string,
  mapping: EnableCssInteropOptions<T> & M,
  interop?: InteropFunction,
) {
  const config = getNormalizeConfig(mapping);

  interop ??= defaultInteropRef.current;

  let render: any = <P extends { ___pressable?: true }>(
    { children, ___pressable, ...props }: PropsWithChildren<P>,
    ref: unknown,
  ) => {
    if (ref) {
      (props as any).ref = ref;
    }

    if (___pressable) {
      return createElement(component, props as unknown as T, children);
    } else {
      interopGlobal.isInComponent = true;
      interopGlobal.current = null;

      const element = createElement(
        ...interop!(component, config, props as unknown as T, children),
      );
      const originalType = element.props;

      /**
       * We can't update another element while rendering, so we need to delay the update.
       * Before React can process the element, it must check its props.
       * So by 'hooking' into it, we can use this as our delaying mechanism
       */
      return Object.create(element, {
        props: {
          get() {
            interopGlobal.isInComponent = false;
            interopGlobal.current = null;
            if (interopGlobal.delayedEvents.size) {
              for (const sub of interopGlobal.delayedEvents) {
                sub();
              }
              interopGlobal.delayedEvents.clear();
            }
            return originalType;
          },
        },
      });
    }
  };

  if (process.env.NODE_ENV === "development") {
    if (typeof component === "string") {
      render.displayName = `CSSInterop.${component}`;
    } else {
      render.displayName = `CSSInterop.${
        component.displayName ?? component.name ?? "unknown"
      }`;
    }
  }

  render = forwardRef(render);

  const checkArray = (props: any[]) =>
    props.some((prop): boolean => {
      return Array.isArray(prop) ? checkArray(prop) : opaqueStyles.has(prop);
    });

  const interopComponent: InteropTypeCheck<T> = {
    type: render,
    createElementWithInterop(props, children) {
      return createElement(...interop!(component, config, props, children));
    },
    check(props: Record<string, unknown>) {
      for (const [targetProp, source, nativeStyleToProp] of config.config) {
        if (nativeStyleToProp) return true;

        if (typeof props[source] === "string") {
          return true;
        }

        const target: any = props[targetProp];

        if (Array.isArray(target)) {
          if (checkArray(target)) {
            return true;
          }
        } else if (opaqueStyles.has(target)) {
          return true;
        }
      }

      return false;
    },
  };

  interopComponents.set(component, interopComponent);
}
