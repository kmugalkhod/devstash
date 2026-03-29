import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import {
  deleteCollection as deleteCollectionDb,
  updateCollection as updateCollectionDb,
} from "@/lib/db/collections";

const updateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Collection name is required").max(120),
  description: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .transform((value) => value || null),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCollectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    const result = await updateCollectionDb(session.user.id, id, parsed.data);

    if (result === "NOT_FOUND") {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    if (result === "DUPLICATE") {
      return NextResponse.json(
        { error: "Collection name already exists" },
        { status: 409 }
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/collections");
    revalidatePath(`/collections/${id}`);

    return NextResponse.json({ success: true, collection: result });
  } catch {
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await deleteCollectionDb(session.user.id, id);

    if (!deleted) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    revalidatePath("/dashboard");
    revalidatePath("/collections");
    revalidatePath(`/collections/${id}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}
