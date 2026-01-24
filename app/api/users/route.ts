import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user's auth ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Auth user ID:", user.id);

    // Get current user's institution_id
    const { data: currentUser, error: currentUserError } = await supabase
      .from("users")
      .select("institution_id, role")
      .eq("auth_id", user.id)
      .single();

    console.log("Current user query result:", { currentUser, currentUserError });

    if (currentUserError || !currentUser) {
      console.error("User not found in public.users table for auth_id:", user.id);
      console.error("Error details:", currentUserError);
      return NextResponse.json({ 
        error: "User profile not found. Please contact support.",
        details: "No matching record in users table for this auth user"
      }, { status: 404 });
    }

    // Fetch all users in the institution with their branch info
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select(`
        id,
        auth_id,
        name,
        email,
        phone,
        role,
        branch_id,
        created_at,
        branches (
          id,
          name
        )
      `)
      .eq("institution_id", currentUser.institution_id)
      .order("created_at", { ascending: false });

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    // Transform data to flatten branch info
    const transformedUsers = users?.map(user => ({
      id: user.id,
      authId: user.auth_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      branchId: user.branch_id,
      branchName: user.branches ? (Array.isArray(user.branches) ? user.branches[0]?.name : (user.branches as { name: string })?.name) : null,
      createdAt: user.created_at,
      // Determine status based on whether auth_id exists
      status: user.auth_id ? "active" : "pending",
    })) || [];

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error("Error in users API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
