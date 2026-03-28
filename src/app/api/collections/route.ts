import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { createCollection as createCollectionDb } from "@/lib/db/collections";

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Collection name is required").max(120),
  description: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .transform((value) => value || null),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createCollectionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Validation failed" },
        { status: 400 }
      );
    }

    const created = await createCollectionDb(session.user.id, parsed.data);

    if (!created) {
      return NextResponse.json(
        { error: "Collection name already exists" },
        { status: 409 }
      );
    }

    revalidatePath("/dashboard");

    return NextResponse.json(
      {
        success: true,
        collection: created,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}
