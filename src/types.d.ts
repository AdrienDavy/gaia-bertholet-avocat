// /src/types/types.d.ts
export type Post = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  content: string;
  uri: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
    };
  };
};
