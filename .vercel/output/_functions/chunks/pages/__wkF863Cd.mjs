const prerender = false;
const GET = async () => {
  return new Response(JSON.stringify({ data: null }));
};

export { GET, prerender };
