import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  define: {
    // Publishable key is a public value — safe to commit. Hardcoded here so
    // Replit's build process cannot override it with the old replit.app key.
    "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(
      "pk_live_Y2xlcmsucmVzaWxpdW0tcGxhdGZvcm0uY29tJA"
    ),
    // Paddle — injected from environment secrets at build time.
    "import.meta.env.VITE_PADDLE_ENVIRONMENT": JSON.stringify(
      process.env.VITE_PADDLE_ENVIRONMENT ?? "production"
    ),
    // Production credentials
    "import.meta.env.VITE_PADDLE_CLIENT_TOKEN": JSON.stringify(
      process.env.VITE_PADDLE_CLIENT_TOKEN ?? ""
    ),
    "import.meta.env.VITE_PADDLE_PRICE_ID": JSON.stringify(
      process.env.VITE_PADDLE_PRICE_ID ?? ""
    ),
    "import.meta.env.VITE_PADDLE_PRICE_ID_ANNUAL": JSON.stringify(
      process.env.VITE_PADDLE_PRICE_ID_ANNUAL ?? ""
    ),
    "import.meta.env.VITE_PADDLE_DONATION_PRICE_ID": JSON.stringify(
      process.env.VITE_PADDLE_DONATION_PRICE_ID ?? ""
    ),
    // Sandbox credentials (used when VITE_PADDLE_ENVIRONMENT=sandbox)
    "import.meta.env.VITE_PADDLE_SANDBOX_CLIENT_TOKEN": JSON.stringify(
      process.env.VITE_PADDLE_SANDBOX_CLIENT_TOKEN ?? ""
    ),
    "import.meta.env.VITE_PADDLE_SANDBOX_PRICE_ID": JSON.stringify(
      process.env.VITE_PADDLE_SANDBOX_PRICE_ID ?? ""
    ),
    "import.meta.env.VITE_PADDLE_SANDBOX_PRICE_ID_ANNUAL": JSON.stringify(
      process.env.VITE_PADDLE_SANDBOX_PRICE_ID_ANNUAL ?? ""
    ),
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: "hidden",
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
