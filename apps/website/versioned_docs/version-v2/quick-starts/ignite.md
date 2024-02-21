import Dependencies from "../\_dependencies.mdx"

# Ignite

## 1. Add NativeWind

<Dependencies />

## 2. Setup Tailwind CSS

Run `npx tailwindcss init` to create a `tailwind.config.js` file

Add the paths to all of your component files in your tailwind.config.js file.

```diff
// tailwind.config.js

module.exports = {
- content: [],
+ content: ["./app/components/**/*.{js,jsx,ts,tsx}", "./app/screens/**/*.{js,jsx,ts,tsx}", "./ignite/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 3. Add the Babel plugin

Modify your `babel.config.js`

```diff
// babel.config.js
module.exports = {
- plugins: [],
+ plugins: ["nativewind/babel"],
};
```
