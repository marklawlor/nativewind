import connect from "connect";
import loadConfig from "tailwindcss/loadConfig";
import tailwindPackage from "tailwindcss/package.json";
import micromatch from "micromatch";

import path from "path";
import {
  withCssInterop,
  CssToReactNativeRuntimeOptions,
  ComposableIntermediateConfigT,
  middleware as cssInteropMiddleware,
} from "react-native-css-interop/metro";

import { cssToReactNativeRuntimeOptions } from "./common";
import { tailwindCli } from "./tailwind-cli";

interface WithNativeWindOptions extends CssToReactNativeRuntimeOptions {
  input: string;
  projectRoot?: string;
  outputDir?: string;
  configPath?: string;
  cliCommand?: string;
  browserslist?: string | null;
  browserslistEnv?: string | null;
}

const cliPromises: Record<string, ReturnType<typeof tailwindCli>> = {};
const outputCSS: Record<string, string> = {};

export function withNativeWind(
  metroConfig: ComposableIntermediateConfigT,
  {
    input,
    outputDir = ["node_modules", ".cache", "nativewind"].join(path.sep),
    projectRoot = process.cwd(),
    inlineRem = 14,
    configPath: tailwindConfigPath = "tailwind.config.js",
    cliCommand = `node "${path.join(
      require.resolve("tailwindcss/package.json"),
      "../",
      tailwindPackage.bin.tailwindcss,
    )}"`,
    browserslist = "last 1 version",
    browserslistEnv = "native",
  }: WithNativeWindOptions = {} as WithNativeWindOptions,
) {
  if (!input) {
    throw new Error(
      "withNativeWind requires an input parameter: `withNativeWind(config, { input: <css-file> })`",
    );
  }

  input = path.resolve(input);
  const output = path.resolve(
    projectRoot,
    path.join(outputDir, path.basename(input!)),
  );

  const { important } = getTailwindConfig(tailwindConfigPath, output);

  function startCli(platform: string, hot: boolean, dev: boolean) {
    // Only start the Tailwind CLI process onces per platform
    cliPromises[platform] ||= tailwindCli(input!, metroConfig, {
      dev,
      hot,
      platform,
      projectRoot,
      input,
      output: `${output}.${platform}.css`,
      cliCommand,
      browserslist,
      browserslistEnv,
    }).then((css) => {
      if (css) {
        outputCSS[platform] = css;
      }
      return css;
    });

    return cliPromises[platform];
  }

  // Get the CssInterop modified Metro Config (this includes its transform)
  metroConfig = withCssInterop(metroConfig, {
    ...cssToReactNativeRuntimeOptions,
    inlineRem,
    selectorPrefix: typeof important === "string" ? important : undefined,
  });

  // This is marked as deprecated, Expo SDK HEAVY RELIES on this, so its not going anywhere anytime soon
  const enhanceMiddleware = metroConfig.server.enhanceMiddleware;
  const getTransformOptions = metroConfig.transformer.getTransformOptions;

  metroConfig.transformerPath = require.resolve("./transformer");

  metroConfig.server = {
    ...metroConfig.server,
    enhanceMiddleware(middleware, metroServer) {
      let server = connect()
        .use(...cssInteropMiddleware)
        .use("/", async (req, _res, next) => {
          const url = new URL(req.url!, "http://localhost");
          const platform = url.searchParams.get("platform");

          if (platform) {
            try {
              await startCli(
                platform,
                url.searchParams.get("dev") !== "false",
                url.searchParams.get("hot") !== "true",
              );
            } catch (error) {
              return next(error);
            }
          }

          next();
        });

      if (enhanceMiddleware) {
        server = server.use(enhanceMiddleware(middleware, metroServer));
      }

      return server;
    },
  };

  metroConfig.transformer = {
    ...metroConfig.transformer,
    async getTransformOptions(entryPoints, options, getDependenciesOf) {
      await startCli(options.platform!, options.dev, options.hot);
      return getTransformOptions(entryPoints, options, getDependenciesOf);
    },
    nativewind: {
      input,
      output,
      css: outputCSS,
    },
  };

  return metroConfig;
}

function getTailwindConfig(tailwindConfigPath: string, output: string) {
  const config = loadConfig(path.resolve(tailwindConfigPath));
  const content = config.content;
  const contentArray = "files" in content ? content.files : content;
  const matchesOutputDir = contentArray.some((pattern) => {
    if (typeof pattern !== "string") return false;
    return micromatch.isMatch(output, pattern);
  });

  if (matchesOutputDir) {
    throw new Error(
      `NativeWind: Your '${tailwindConfigPath}#content' includes the output file ${output} which will cause an infinite loop. Please read https://tailwindcss.com/docs/content-configuration#styles-rebuild-in-an-infinite-loop`,
    );
  }

  return config;
}
