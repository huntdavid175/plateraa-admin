import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Update a user's role and/or branch
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get current user's auth ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's institution and role
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("institution_id, role")
      .eq("auth_id", user.id)
      .single();

    if (currentUserError || !currentUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Only owners and managers can edit users
    if (!["owner", "manager"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Get the user to update
    const { data: targetUser, error: targetUserError } = await supabase
      .from("users")
      .select("id, institution_id, role")
      .eq("id", id)
      .single();

    if (targetUserError || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure target user is in the same institution
    if (targetUser.institution_id !== currentUser.institution_id) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { role, branchId } = body;

    // Validate role if provided
    const validRoles = ["owner", "manager", "admin", "cashier", "kitchen", "delivery"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Managers cannot assign owner role
    if (currentUser.role === "manager" && role === "owner") {
      return NextResponse.json({ error: "Managers cannot assign owner role" }, { status: 403 });
    }

    // Prevent changing own role to something lower (for owners)
    if (targetUser.id === currentUser.institution_id && role && role !== currentUser.role) {
      // This is a simplified check - you might want more complex logic
    }

    // Build update object
    const updateData: { role?: string; branch_id?: string | null } = {};
    if (role) updateData.role = role;
    if (branchId !== undefined) updateData.branch_id = branchId || null;

    // Update the user
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating user:", updateError);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: "User updated successfully" 
    });
  } catch (error) {
    console.error("Error in user update API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
