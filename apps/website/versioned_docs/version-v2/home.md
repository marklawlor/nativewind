---
title: Home
slug: /
pagination_prev: null
pagination_next: null
custom_edit_url: null
---

# NativeWind

NativeWind uses [Tailwind CSS](https://tailwindcss.com) as scripting language to create a **universal style system** for React Native. NativeWind components can be shared between platforms and will output their styles as CSS StyleSheet on web and StyleSheet.create for native.

It's goals are to provide a consistent styling experience across all platforms, improve Developer UX and code maintainability.

NativeWind achieves this by pre-compiling your styles and uses a minimal runtime to selectively apply responsive styles.

## Key Features

🌐 **Universal** Uses the best style system for each platform.

🛠️ **Precompiled** Uses the Tailwind CSS compile, styles are generated at build time

🚀 **Fast runtime** Small runtime keeps everything fast

🖥️ **DevUX** Plugins for simple setup and improving intellisense support

🔥 **Lots of features** dark mode / arbitrary classes / media queries / themes / custom values / plugins

✨ **Pseudo classes** hover / focus / active on compatible components [(docs)](../core-concepts/states#hover-focus-and-active)

👪 **Parent state styles** automatically style children based upon parent pseudo classes [(docs)](../core-concepts/states#styling-based-on-parent-state)

## In action

```SnackPlayer name=Hello%20World
import { Text, View } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View)
const StyledText = styled(Text)

const App = () => {
  return (
    <StyledView className="flex-1 items-center justify-center">
      <StyledText className="text-slate-800">
        Try editing me! 🎉
      </StyledText>
    </StyledView>
  );
}
```

## With Babel

Our babel plugin will automatically wrap your components in `styled()` reducing the required boilerplate.

```tsx
import { Text, View } from "react-native";

const App = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-slate-800">Styling just works! 🎉</Text>
    </View>
  );
};
```

## What is a universal style system?

A full featured style system should have

- Static styles
- UI state styles (active, hover, focus, etc)
- Responsive styles (media queries, dynamic units)
- Device state styles (orientation, color scheme)
- Styling inheritance
- Use the best rendering engine available

React Native's StyleSheet system only provides static styles, with other features left for the user to implement. By using NativeWind you can focus on writing your system instead of building your own custom style system.

On web, CSS already has all these features and is highly optimized. While on web NativeWind provides a compatibility layer between React Native and CSS.

This is what makes NativeWind a universal style system - it allows you to use the same components with rich styles on all React Native platforms.
