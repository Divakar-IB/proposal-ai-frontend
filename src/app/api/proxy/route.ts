import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  const upstream = await fetch(url);

  if (!upstream.ok) {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: upstream.status });
  }

  const buffer = await upstream.arrayBuffer();
  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";

  return new NextResponse(buffer, {
    headers: { "Content-Type": contentType },
  });
}
