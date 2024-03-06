import { e as createAstro, f as createComponent, r as renderTemplate, i as renderComponent, m as maybeRenderHead, h as addAttribute } from './astro_DPjZd4DK.mjs';
import 'kleur/colors';
import { $ as $$CommonHead, a as $$Header, b as $$BlockRenderer, c as $$Footer } from './pages/__B_mt5hDz.mjs';

const $$Astro$1 = createAstro();
const $$404 = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$404;
  return renderTemplate`<html lang="fr"> ${renderComponent($$result, "CommonHead", $$CommonHead, { "title": "Non trouv\xE9 !", "description": "" })}${maybeRenderHead()}<body class="bg-blue-sky text-white"> <div class="text-center flex flex-col justify-center min-h-screen w-8/12 mx-auto"> <h1>Oops !</h1> <h2>Page non trouvée !</h2> <a href="/" class="text-blue-light block py-3 hover:text-blue-400 transition-all text-nowrap max-w-min mx-auto">Retour à la page d'accueil</a> </div> </body></html>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Ga\xEFa/frontend_astro/gaia-bertholet-avocat-astro/src/pages/404.astro", void 0);

const $$file$1 = "D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/pages/404.astro";
const $$url$1 = "/404";

const _404 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file$1,
  url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const GET$1 = async () => {
  try {
    const response = await fetch(`${"http://gaia-bertholet-avocat.local/graphql"}`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        query: `
          query AllPosts{        
            posts(first: 10000, where: {orderby: {field: DATE, order: DESC}}) {
              nodes {
                databaseId
                title
                date
                excerpt
                slug
                content
                uri
                featuredImage {
                  node {
                    sourceUrl
                    altText
                    mediaDetails {
                      height
                      width
                    }
                  }
                }
              }
            }
          }
          `
      })
    });
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! status: ${response.status}`);
    }
    const { data } = await response.json();
    return new Response(JSON.stringify({ posts: data.posts.nodes }), {
      status: 200
    });
  } catch (error) {
    console.error("Erreur d'extraction des articles:", error);
    return new Response(
      JSON.stringify({ error: "Impossible d'extraire les articles" }),
      {
        status: 500
      }
    );
  }
};

const articles_json = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET: GET$1
}, Symbol.toStringTag, { value: 'Module' }));

const GET = async ({ params }) => {
  const uri = params.uri;
  const response = await fetch(`${"http://gaia-bertholet-avocat.local/graphql"}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `
      query PageQuery($uri: String!) {
        allSettings {
      generalSettingsLanguage
    }
        nodeByUri(uri: $uri) {
          ... on ContentNode {
            databaseId
            blocks
            seo {
              metaDesc
              title
            }
          }
        }      
      }
      `,
      variables: {
        uri: uri || "/"
      }
    })
  });
  const { data } = await response.json();
  return new Response(JSON.stringify({ data: data.nodeByUri }));
};
async function getStaticPaths$1() {
  const response = await fetch(`${"http://gaia-bertholet-avocat.local/graphql"}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `
  query AllPages {
          pages(first: 10000) {
            nodes {
              uri
              blocks
            }
          }
          posts(first: 10000) {
            nodes {
              uri
              blocks
            }
          }
        }
      `
    })
  });
  try {
    const { data } = await response.json();
    return [...data.pages.nodes, ...data.posts.nodes].filter((page) => {
      let found = false;
      const hasActualites = (blocks) => {
        for (let block of blocks) {
          if (block.name === "astro/article-search") {
            found = true;
            break;
          }
          if (block.innerBlocks) {
            hasActualites(block.innerBlocks);
          }
        }
      };
      hasActualites(page.blocks);
      return found;
    }).map((page) => ({
      params: {
        uri: page.uri === "/" ? void 0 : page.uri.substring(1, page.uri.length - 1)
      }
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la requête ou lors du traitement des données :",
      error
    );
    throw new Error("Impossible d'extraire les données");
  }
}

const ____uri__json = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  getStaticPaths: getStaticPaths$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$Astro = createAstro();
async function getStaticPaths() {
  const response = await fetch(`${"http://gaia-bertholet-avocat.local/graphql"}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `
  query AllPages {
          pages(first: 10000) {
            nodes {
              uri
              blocks
            }
          }
          posts(first: 10000) {
            nodes {
              uri
              blocks
            }
          }
        }
      `
    })
  });
  try {
    const { data } = await response.json();
    return [...data.pages.nodes, ...data.posts.nodes].filter((page) => {
      let found = false;
      const hasActualites = (blocks) => {
        for (let block of blocks) {
          if (block.name === "astro/article-search") {
            found = true;
            break;
          }
          if (block.innerBlocks) {
            hasActualites(block.innerBlocks);
          }
        }
      };
      hasActualites(page.blocks);
      return !found;
    }).map((page) => ({
      params: { slug: page.uri === "/" ? void 0 : page.uri }
    }));
  } catch (error) {
    console.error(
      "Erreur lors de la requête ou lors du traitement des données :",
      error
    );
    throw new Error("Impossible d'extraire les données");
  }
}
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const astroParams = Astro2.params;
  const response = await fetch(`${"http://gaia-bertholet-avocat.local/graphql"}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `
    query PageQuery($uri: String!) {
      allSettings {
    generalSettingsLanguage
  }
      nodeByUri(uri: $uri) {
        ... on ContentNode {
          databaseId
          blocks
          seo {
            metaDesc
            title
          }
        }
      }      
    }
    `,
      variables: {
        uri: astroParams.slug || "/"
      }
    })
  });
  const { data } = await response.json();
  const blocks = data.nodeByUri?.blocks || [];
  const seo = data.nodeByUri?.seo;
  const language = data.allSettings.generalSettingsLanguage;
  const postId = data.nodeByUri?.databaseId;
  return renderTemplate`<html${addAttribute(language, "lang")}> ${renderComponent($$result, "CommonHead", $$CommonHead, { "title": seo.title || "", "description": seo.metaDesc || "" })}${maybeRenderHead()}<body> ${renderComponent($$result, "Header", $$Header, { "blocks": blocks })} ${renderComponent($$result, "BlockRenderer", $$BlockRenderer, { "postId": postId, "blocks": blocks })} ${renderComponent($$result, "Footer", $$Footer, { "blocks": blocks })} </body></html>`;
}, "D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/pages/[...slug].astro", void 0);
const $$file = "D:/Adrien/Documents/Developpement Web/Site de Gaïa/frontend_astro/gaia-bertholet-avocat-astro/src/pages/[...slug].astro";
const $$url = "/[...slug]";

const ____slug_ = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { _404 as _, articles_json as a, ____uri__json as b, ____slug_ as c };
