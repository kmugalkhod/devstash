import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadToR2 } from "@/lib/r2";
import { parseUploadItemType, validateUploadFile } from "@/lib/upload-constraints";
import { isUserPro } from "@/lib/pro";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const itemTypeRaw = formData.get("itemType");
    const file = formData.get("file");

    if (typeof itemTypeRaw !== "string") {
      return NextResponse.json(
        { error: "itemType is required" },
        { status: 400 }
      );
    }

    const itemType = parseUploadItemType(itemTypeRaw);
    if (!itemType) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    if (!(await isUserPro(session.user.id))) {
      return NextResponse.json(
        { error: "Upgrade to Pro to upload files and images" },
        { status: 403 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const validation = validateUploadFile(file, itemType);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const body = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToR2({
      userId: session.user.id,
      fileName: file.name,
      body,
      contentType: file.type || undefined,
    });

    return NextResponse.json({
      key: uploaded.key,
      fileName: file.name,
      fileSize: file.size,
      publicUrl: uploaded.publicUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
