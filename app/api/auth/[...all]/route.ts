import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

// Origin của FE (devtunnels)
const ALLOWED_ORIGIN = "https://qg1jv8hj-3000.asse.devtunnels.ms";

function applyCors(res: Response) {
  res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  return res;
}

export async function GET(req: Request) {
  const res = await handler.GET(req);
  return applyCors(res);
}

export async function POST(req: Request) {
  const res = await handler.POST(req);
  return applyCors(res);
}

export function OPTIONS() {
  return applyCors(
    new Response(null, {
      status: 204,
    })
  );
}
