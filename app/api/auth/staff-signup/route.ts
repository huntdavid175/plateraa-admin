import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, institutionCode } = body;

    // Validate required fields
    if (!name || !email || !password || !institutionCode) {
      return NextResponse.json(
        { error: "Name, email, password, and institution code are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Create admin client to bypass RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Validate the institution code
    const { data: codeValidation, error: codeError } = await supabaseAdmin.rpc(
      "validate_institution_code",
      { p_code: institutionCode.toUpperCase().trim() }
    );

    if (codeError) {
      console.error("Error validating code:", codeError);
      return NextResponse.json(
        { error: "Failed to validate institution code" },
        { status: 500 }
      );
    }

    // Check if code is valid
    const validationResult = codeValidation?.[0];
    if (!validationResult?.is_valid) {
      return NextResponse.json(
        { error: validationResult?.error_message || "Invalid institution code" },
        { status: 400 }
      );
    }

    const institutionId = validationResult.institution_id;

    // Create the auth user with metadata (trigger will create public.users record)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for staff
      user_metadata: {
        name,
        phone: phone || null,
        institution_id: institutionId,
        role: "cashier",
      },
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: authError.message || "Failed to create account" },
        { status: 500 }
      );
    }

    // Increment the code usage counter
    await supabaseAdmin.rpc("use_institution_code", {
      p_code: institutionCode.toUpperCase().trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      institutionName: validationResult.institution_name,
    });
  } catch (error) {
    console.error("Error in staff signup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
