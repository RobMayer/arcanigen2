import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { join } from "path";

const PACKAGE_ROOT = __dirname;

// https://vitejs.dev/config/
export default defineConfig({
   plugins: [react()],
   resolve: {
      alias: {
         "!/": join(PACKAGE_ROOT, "src/") + "/",
      },
   },
});
