import { onRequestGet as __api_generate_js_onRequestGet } from "C:\\Users\\User\\massiveandslightlypassive\\accessibility-dashboard\\functions\\api\\generate.js"
import { onRequestPost as __api_generate_js_onRequestPost } from "C:\\Users\\User\\massiveandslightlypassive\\accessibility-dashboard\\functions\\api\\generate.js"

export const routes = [
    {
      routePath: "/api/generate",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_generate_js_onRequestGet],
    },
  {
      routePath: "/api/generate",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_generate_js_onRequestPost],
    },
  ]