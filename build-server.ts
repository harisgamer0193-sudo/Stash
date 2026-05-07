import { build } from "esbuild";

async function buildServer() {
  await build({
    entryPoints: ["server.ts"],
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: "dist/server.cjs",
    external: ["vite", "fsevents"],
  });
}

buildServer();
