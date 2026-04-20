import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type UploadKind = "avatar" | "logo";

function isValidKind(value: string | null): value is UploadKind {
  return value === "avatar" || value === "logo";
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Uploads aren't configured on this deployment. Set BLOB_READ_WRITE_TOKEN.",
      },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const kindRaw = formData.get("kind");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (!isValidKind(typeof kindRaw === "string" ? kindRaw : null)) {
    return NextResponse.json(
      { error: "Invalid upload kind" },
      { status: 400 },
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, WebP, or GIF" },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File must be under 5 MB" },
      { status: 413 },
    );
  }

  const ext = file.type.split("/")[1] ?? "jpg";
  const path = `${kindRaw}/${userId}/${Date.now()}.${ext}`;

  const blob = await put(path, file, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: false,
  });

  return NextResponse.json({ url: blob.url });
}
