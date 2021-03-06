import path from "path";
import { Configuration } from "webpack";
import TerserWebpackPlugin from "terser-webpack-plugin";
const ModuleFederationPlugin =
  require("webpack").container.ModuleFederationPlugin;

const config: Configuration = {
  entry: {
    index: "./src/index.tsx",
    loaders: "./src/loaders.ts",
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-typescript"],
            plugins: [
              [
                "@babel/plugin-transform-react-jsx",
                {
                  throwIfNamespace: false,
                  runtime: "automatic",
                  importSource: "atomico",
                },
              ],
              [
                "@babel/plugin-transform-runtime",
                {
                  regenerator: true,
                },
              ],
              "@babel/plugin-syntax-dynamic-import",
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".jsx", ".ts", ".js"],
  },
  devtool: undefined,
  optimization: {
    minimize: true,
    minimizer: [
      new TerserWebpackPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
        },
      }),
    ],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "modfed.[name].js",
    library: {
        type: 'umd'
    }
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "comp-container",
    }),
  ],
};

export default config;