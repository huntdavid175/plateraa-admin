import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// DELETE - Remove an institution code
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's institution_id and role
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("institution_id, role")
      .eq("auth_id", user.id)
      .single();

    if (currentUserError || !currentUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Only owners and managers can delete codes
    if (!["owner", "manager"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Verify the code belongs to this institution
    const { data: code, error: codeError } = await supabase
      .from("institution_codes")
      .select("id, institution_id")
      .eq("id", id)
      .single();

    if (codeError || !code) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 });
    }

    if (code.institution_id !== currentUser.institution_id) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Delete the code
    const { error: deleteError } = await supabase
      .from("institution_codes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting code:", deleteError);
      return NextResponse.json({ error: "Failed to delete code" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Code deleted successfully" 
    });
  } catch (error) {
    console.error("Error in institution codes API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Toggle code active status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's institution_id and role
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("institution_id, role")
      .eq("auth_id", user.id)
      .single();

    if (currentUserError || !currentUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Only owners and managers can update codes
    if (!["owner", "manager"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const { isActive } = body;

    // Update the code
    const { data: updatedCode, error: updateError } = await supabase
      .from("institution_codes")
      .update({ is_active: isActive })
      .eq("id", id)
      .eq("institution_id", currentUser.institution_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating code:", updateError);
      return NextResponse.json({ error: "Failed to update code" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      code: updatedCode,
      message: "Code updated successfully" 
    });
  } catch (error) {
    console.error("Error in institution codes API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
