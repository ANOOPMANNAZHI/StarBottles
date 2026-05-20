import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, business_type, message } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Mobile number is required." },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/api/v1/enquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        customer_name: name || null,
        phone,
        email: email || null,
        message: [
          business_type ? `Business Type: ${business_type}` : "",
          message || "",
        ]
          .filter(Boolean)
          .join("\n") || null,
        type: "callback",
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("[callback API] Backend error:", err);
      return NextResponse.json(
        { error: "Failed to submit request. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("[callback API error]", err);
    return NextResponse.json(
      { error: "Failed to submit request. Please try again." },
      { status: 500 }
    );
  }
}
