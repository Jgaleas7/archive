import { getAuth } from "@/lib/auth";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

const handler = async (request) => {
  const db = getRequestContext().env.DB;
  const auth = getAuth(db);
  return auth.handler(request);
};

export { handler as GET, handler as POST };
