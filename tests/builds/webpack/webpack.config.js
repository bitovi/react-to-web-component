const path = require("path")

module.exports = {
  entry: "./src/index.tsx",
  experiments: {
    outputModule: true,
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "build"),
    library: {
      type: "module",
    },
  },
  module: {
    // exclude node_modules
    rules: [
      {
        test: /\.(tsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre",
      },
    ],
  },
  // pass all js files through Babel
  resolve: {
    extensions: ["*", ".js", ".tsx"],
  },
}
