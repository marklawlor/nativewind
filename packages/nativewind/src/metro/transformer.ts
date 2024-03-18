import { readFileSync } from "fs";
import worker, {
  JsTransformerConfig,
  JsTransformOptions,
  TransformResponse,
} from "metro-transform-worker";
import path from "path";

import { transform as cssInteropTransform } from "react-native-css-interop/metro/transformer";

export async function transform(
  config: JsTransformerConfig & { nativewind: Record<string, any> },
  projectRoot: string,
  filename: string,
  data: Buffer,
  options: JsTransformOptions,
): Promise<TransformResponse> {
  if (path.resolve(process.cwd(), filename) === config.nativewind.input) {
    if (options.platform === "web") {
      // Frameworks like Expo correctly handle the CSS, so just redirect to the Tailwind generated file
      return worker.transform(
        config,
        projectRoot,
        filename,
        Buffer.from(`require('${config.nativewind.output.replace(/\\/g, '\\\\')}');`, "utf8"),
        options,
      );
    } else {
      // We might already have the css in memory, otherwise read it from the file system
      const css =
        config.nativewind.css[options.platform ?? "native"] ??
        readFileSync(
          require.resolve(
            `${config.nativewind.output}.${options.platform!}.css`,
          ),
          "utf8",
        );

      // react-native-css-interop will inject a hot-reload server. So just set the CSS as the data
      data = Buffer.from(css, "utf8");
    }
  }

  // Otherwise use the cssInteropTransform. It will handle JS files and composing transformers
  return cssInteropTransform(config, projectRoot, filename, data, options);
}
