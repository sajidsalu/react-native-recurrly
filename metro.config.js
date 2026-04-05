const { getDefaultConfig } = require("expo/metro-config");
const fs = require("fs");
const path = require("path");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const upstreamResolveRequest = config.resolver.resolveRequest;

/**
 * Metro sometimes fails to resolve `require("./dir")` inside `@clerk/expo/dist` to
 * `dir/index.js` (e.g. `./provider/singleton`). Map directory imports explicitly.
 */
function resolveClerkExpoDirectoryImport(context, moduleName) {
  if (!moduleName.startsWith(".")) {
    return null;
  }
  const origin = context.originModulePath.replace(/\\/g, "/");
  if (!origin.includes("/node_modules/@clerk/expo/dist/")) {
    return null;
  }
  const absDir = path.normalize(
    path.join(path.dirname(context.originModulePath), moduleName),
  );
  try {
    if (fs.existsSync(absDir) && fs.statSync(absDir).isDirectory()) {
      const indexFile = path.join(absDir, "index.js");
      if (fs.existsSync(indexFile)) {
        return { type: "sourceFile", filePath: indexFile };
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const clerkResolved = resolveClerkExpoDirectoryImport(context, moduleName);
  if (clerkResolved) {
    return clerkResolved;
  }
  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativewind(config);
