import type { Block } from "@wp-block-tools/styles";
import type { APIRoute } from "astro";
export const GET: APIRoute = async ({ params }) => {
  const uri = params.uri;
  const response = await fetch(`${import.meta.env.WPGRAPHQL_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      query PageQuery($uri: String!) {
        allSettings {
      generalSettingsLanguage
    }
        nodeByUri(uri: $uri) {
          ... on ContentNode {
            id
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
        uri: uri || "/",
      },
    }),
  });

  const { data } = await response.json();
  return new Response(JSON.stringify({ data: data.nodeByUri }));
};
export async function getStaticPaths() {
  // api/page-data/actualites.json
  const response = await fetch(`${import.meta.env.WPGRAPHQL_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
      `,
    }),
  });
  try {
    const { data } = await response.json();
    return [...data.pages.nodes, ...data.posts.nodes]
      .filter((page: any) => {
        let found = false;
        const hasArticleSearch = (blocks: Block[]) => {
          for (let block of blocks) {
            if (block.name === "astro/article-search") {
              found = true;
              break;
            }
            if (block.innerBlocks) {
              hasArticleSearch(block.innerBlocks);
            }
          }
        };
        hasArticleSearch(page.blocks);
        return found;
      })
      .map((page: any) => ({
        params: {
          uri:
            page.uri === "/"
              ? undefined
              : page.uri.substring(1, page.uri.length - 1),
        },
      }));
  } catch (error) {
    console.error(
      "Erreur lors de la requête ou lors du traitement des données :",
      error,
    );
    throw new Error("Impossible d'extraire les données");
  }
}
