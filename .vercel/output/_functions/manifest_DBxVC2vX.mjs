import 'cookie';
import { bold, red, yellow, dim, blue } from 'kleur/colors';
import './chunks/astro_DPjZd4DK.mjs';
import 'clsx';
import { compile } from 'path-to-regexp';

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return red(prefix.join(" "));
  }
  if (level === "warn") {
    return yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return dim(prefix[0]);
  }
  return dim(prefix[0]) + " " + blue(prefix.splice(1).join(" "));
}
if (typeof process !== "undefined") {
  let proc = process;
  if ("argv" in proc && Array.isArray(proc.argv)) {
    if (proc.argv.includes("--verbose")) ; else if (proc.argv.includes("--silent")) ; else ;
  }
}
class Logger {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
}
class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
}

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware(_, next) {
      return next();
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    clientDirectives,
    routes
  };
}

const manifest = deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"404.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"api/articles.json","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/articles.json","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/articles\\.json\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"articles.json","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/articles.json.ts","pathname":"/api/articles.json","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/page-data/[...urissr]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/page-data\\/(.*?)\\.json\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"page-data","dynamic":false,"spread":false}],[{"content":"...urissr","dynamic":true,"spread":true},{"content":".json","dynamic":false,"spread":false}]],"params":["...urissr"],"component":"src/pages/api/page-data/[...urissr].json.ts","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/hoisted.BvS5hpXd.js"}],"styles":[{"type":"external","src":"/_astro/_slug_.CTSran_3.css"},{"type":"inline","content":"@keyframes astroFadeInOut{0%{opacity:1}to{opacity:0}}@keyframes astroFadeIn{0%{opacity:0}}@keyframes astroFadeOut{to{opacity:0}}@keyframes astroSlideFromRight{0%{transform:translate(100%)}}@keyframes astroSlideFromLeft{0%{transform:translate(-100%)}}@keyframes astroSlideToRight{to{transform:translate(100%)}}@keyframes astroSlideToLeft{to{transform:translate(-100%)}}@media (prefers-reduced-motion){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}[data-astro-transition-scope]{animation:none!important}}\n"}],"routeData":{"route":"/[...ssr]","isIndex":false,"type":"page","pattern":"^(?:\\/(.*?))?\\/?$","segments":[[{"content":"...ssr","dynamic":true,"spread":true}]],"params":["...ssr"],"component":"src/pages/[...ssr].astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/pages/404.astro",{"propagation":"none","containsHead":true}],["D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/pages/[...slug].astro",{"propagation":"in-tree","containsHead":true}],["D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/pages/[...ssr].astro",{"propagation":"in-tree","containsHead":true}],["D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/components/Heading.astro",{"propagation":"in-tree","containsHead":false}],["D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/components/BlockRenderer.astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/[...slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/[...ssr]@_@astro",{"propagation":"in-tree","containsHead":false}],["D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/components/Footer.astro",{"propagation":"in-tree","containsHead":false}],["D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/components/Actualites.astro",{"propagation":"in-tree","containsHead":false}],["D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/components/LatestPosts.astro",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var i=t=>{let e=async()=>{await(await t())()};\"requestIdleCallback\"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000noop-middleware":"_noop-middleware.mjs","/src/pages/api/page-data/[...urissr].json.ts":"chunks/pages/__wkF863Cd.mjs","/node_modules/astro/dist/assets/endpoint/generic.js":"chunks/pages/generic_ehh8r5lG.mjs","\u0000@astrojs-manifest":"manifest_DBxVC2vX.mjs","D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/node_modules/@astrojs/react/vnode-children.js":"chunks/vnode-children_Hb05nn4I.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"chunks/generic_My6K2HLt.mjs","\u0000@astro-page:src/pages/404@_@astro":"chunks/404_zXlspeKN.mjs","\u0000@astro-page:src/pages/api/articles.json@_@ts":"chunks/articles_Dv18WhMx.mjs","\u0000@astro-page:src/pages/api/page-data/[...uri].json@_@ts":"chunks/_...uri__D5mToUy4.mjs","\u0000@astro-page:src/pages/api/page-data/[...urissr].json@_@ts":"chunks/_...urissr__Pt-kY_XQ.mjs","\u0000@astro-page:src/pages/[...slug]@_@astro":"chunks/_.._CucniQzN.mjs","\u0000@astro-page:src/pages/[...ssr]@_@astro":"chunks/_.._BcSUc3Mj.mjs","D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/components/ContactForm7.tsx":"_astro/ContactForm7.cDJSWDs7.js","/astro/hoisted.js?q=0":"_astro/hoisted.BvS5hpXd.js","/astro/hoisted.js?q=1":"_astro/hoisted.DqR2iBSn.js","@astrojs/react/client.js":"_astro/client.C9CDoPFW.js","D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/components/MobileMenu.tsx":"_astro/MobileMenu.v8zhVXtf.js","astro:scripts/before-hydration.js":""},"assets":["/_astro/montserrat-cyrillic-wght-normal.CHYi_LmU.woff2","/_astro/montserrat-cyrillic-ext-wght-normal.rV1oiNxr.woff2","/_astro/montserrat-latin-ext-wght-normal.BIVePy9u.woff2","/_astro/montserrat-latin-wght-normal.BDA6280a.woff2","/_astro/montserrat-vietnamese-wght-normal.BXWSX9tz.woff2","/_astro/_slug_.CTSran_3.css","/favicon.svg","/immobilier.jpg","/_astro/client.C9CDoPFW.js","/_astro/ContactForm7.cDJSWDs7.js","/_astro/hoisted.BvS5hpXd.js","/_astro/hoisted.DqR2iBSn.js","/_astro/index.CSLRt44l.js","/_astro/jsx-runtime.Biu9vCfE.js","/_astro/MobileMenu.v8zhVXtf.js","/404.html","/api/articles.json"],"buildFormat":"directory"});

export { AstroIntegrationLogger as A, Logger as L, getEventPrefix as g, levels as l, manifest };
