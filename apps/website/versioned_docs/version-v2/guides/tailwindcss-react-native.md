# Migrating from tailwindcss-react-native

Previously this project was called `tailwindcss-react-native`. If you are migrating from this project these are the breaking changes

## tailwind.config.js is required

NativeWind aligns with TailwindCSS and requires you have a `tailwind.config.js` file with a `content` glob.

## TailwindProvider has been removed

`tailwindcss-react-native` used React context to push updates to components. Unfortunately this approach does not scale, as every styled component needed to revaluate when the context changed. NativeWind replaces the `TailwindProvider` and `useContext` with `NativeWindStyleSheet` and `useSyncExternalStore`, providing greater control over which components should re-render.

As such, you will need to remove `TailwindProvider` from your application.

Configuration is now performed by calling methods on `NativeWindStyleSheet`. Please read the docs for more info about NativeWindStyleSheet

## CSS is the default for web

NativeWind defaults to CSS for web if using React Native Web >=0.18

You can control this setting via the `NativeWindStyleSheet.setOutput({ web: 'native' })`

## useTailwind()

`useTailwind()` has been removed.

## spreadProps option on styled() has been removed

For most cases the classProps option should work as people expect, but due to issues with CSS this option was removed.
