interface queryParams {
  query: string;
  variables?: object;
}
export async function wordpressQuery({ query, variables = {} }: queryParams) {
  const response = await fetch(`${import.meta.env.WPGRAPHQL_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  if (!response.ok) {
    console.error(response);
    return {};
  }
  const { data } = await response.json();
  return data;
}
