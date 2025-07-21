import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { integration } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ integrationId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { integrationId } = await params;
    
    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 }
      );
    }
    
    // Get the integration to verify ownership
    const existingIntegration = await db.select().from(integration).where(
      and(
        eq(integration.id, integrationId),
        eq(integration.userId, userId)
      )
    );
    
    if (!existingIntegration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }
    
    // Soft delete by setting deletedAt and disabled
    await db.update(integration)
      .set({
        deletedAt: new Date(),
        disabled: true
      })
      .where(
        and(
          eq(integration.id, integrationId),
          eq(integration.userId, userId)
        )
      );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting integration:", error);
    return NextResponse.json(
      { error: "Failed to delete integration" },
      { status: 500 }
    );
  }
} 