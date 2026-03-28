import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFromR2 } from "@/lib/r2";
import { getItemById } from "@/lib/db/items";

function toWebStream(body: unknown): ReadableStream<Uint8Array> | null {
  if (!body) return null;

  if (
    typeof body === "object" &&
    body !== null &&
    "transformToWebStream" in body &&
    typeof body.transformToWebStream === "function"
  ) {
    return body.transformToWebStream() as ReadableStream<Uint8Array>;
  }

  if (body instanceof Readable) {
    return Readable.toWeb(body) as ReadableStream<Uint8Array>;
  }

  return null;
}

function getDisposition(
  fileName: string,
  shouldDownload: boolean
): "inline" | "attachment" {
  if (shouldDownload) return "attachment";
  return "inline";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const item = await getItemById(id, session.user.id);

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!item.fileUrl || !item.fileName) {
      return NextResponse.json(
        { error: "Item has no uploaded file" },
        { status: 400 }
      );
    }

    const object = await getFromR2(item.fileUrl);
    const stream = toWebStream(object.body);

    if (!stream) {
      return NextResponse.json(
        { error: "File stream unavailable" },
        { status: 500 }
      );
    }

    const searchParams = new URL(request.url).searchParams;
    const forceDownload = searchParams.get("download") === "1";
    const shouldDownload = forceDownload || item.type.name !== "image";

    const headers = new Headers();
    headers.set(
      "Content-Type",
      object.contentType || "application/octet-stream"
    );
    headers.set(
      "Content-Disposition",
      `${getDisposition(item.fileName, shouldDownload)}; filename="${encodeURIComponent(item.fileName)}"`
    );

    if (typeof object.contentLength === "number") {
      headers.set("Content-Length", String(object.contentLength));
    }

    return new NextResponse(stream, { headers });
  } catch {
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
