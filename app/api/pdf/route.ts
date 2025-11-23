export async function GET() {
  const url =
    "http://127.0.0.1:8000/download/de-thi-trung-tu-giua-hk1-so-5.pdf?user_email=anpham08112009%40gmail.com";

  const res = await fetch(url, {
    headers: {
      Accept: "application/pdf",
    },
  });

  if (!res.ok) {
    return new Response("Failed to fetch PDF", { status: 500 });
  }

  const buffer = await res.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
    },
  });
}
