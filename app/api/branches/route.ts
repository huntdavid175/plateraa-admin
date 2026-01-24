import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user's auth ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's institution_id
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("institution_id")
      .eq("auth_id", user.id)
      .single();

    if (currentUserError || !currentUser) {
      console.error("User not found:", currentUserError);
      return NextResponse.json({ 
        error: "User profile not found",
        details: "No matching record in users table"
      }, { status: 404 });
    }

    // Fetch all branches for the institution
    const { data: branches, error: branchesError } = await supabase
      .from("branches")
      .select("id, name, address")
      .eq("institution_id", currentUser.institution_id)
      .order("name");

    if (branchesError) {
      console.error("Error fetching branches:", branchesError);
      console.error("Institution ID:", currentUser.institution_id);
      return NextResponse.json({ 
        error: "Failed to fetch branches",
        details: branchesError.message,
        code: branchesError.code
      }, { status: 500 });
    }

    return NextResponse.json({ branches: branches || [] });
  } catch (error) {
    console.error("Error in branches API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
