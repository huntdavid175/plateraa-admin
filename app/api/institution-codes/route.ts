import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET - Fetch all institution codes
export async function GET() {
  try {
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

    // Only owners and managers can view codes
    if (!["owner", "manager"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Fetch all codes for the institution
    const { data: codes, error: codesError } = await supabase
      .from("institution_codes")
      .select("id, code, name, is_active, uses_count, max_uses, expires_at, created_at")
      .eq("institution_id", currentUser.institution_id)
      .order("created_at", { ascending: false });

    if (codesError) {
      console.error("Error fetching codes:", codesError);
      console.error("Institution ID:", currentUser.institution_id);
      return NextResponse.json({ 
        error: "Failed to fetch codes",
        details: codesError.message 
      }, { status: 500 });
    }

    console.log("Fetched codes:", codes?.length, "for institution:", currentUser.institution_id);

    return NextResponse.json({ codes: codes || [] });
  } catch (error) {
    console.error("Error in institution codes API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new institution code
export async function POST(request: Request) {
  try {
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

    // Only owners and managers can create codes
    if (!["owner", "manager"].includes(currentUser.role)) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const { code, name, maxUses, expiresAt } = body;

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    // Insert the new code
    const { data: newCode, error: insertError } = await supabase
      .from("institution_codes")
      .insert({
        institution_id: currentUser.institution_id,
        code: code.toUpperCase().trim(),
        name: name || null,
        max_uses: maxUses || null,
        expires_at: expiresAt || null,
        is_active: true,
        uses_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating code:", insertError);
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "This code already exists" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to create code" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      code: newCode,
      message: "Code created successfully" 
    });
  } catch (error) {
    console.error("Error in institution codes API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
