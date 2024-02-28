import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    const response = await fetch(`${import.meta.env.WPGRAPHQL_URL}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query AllPosts{        
            posts(first: 10000, where: {orderby: {field: DATE, order: DESC}}) {
              nodes {
                id
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
          `,
      }),
    });
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! status: ${response.status}`);
    }
    const { data } = await response.json();
    return new Response(JSON.stringify({ posts: data.posts.nodes }), {
      status: 200,
    });
  } catch (error) {
    // Log the error or handle it as you see fit
    console.error("Erreur d'extraction des articles:", error);
    return new Response(
      JSON.stringify({ error: "Impossible d'extraire les articles" }),
      {
        status: 500,
      },
    );
  }
};
