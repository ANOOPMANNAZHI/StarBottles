import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, product, company, quantity, message } = body;

    if (!name || !email || !phone || !product) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, phone, and product are required." },
        { status: 400 }
      );
    }

    // Forward enquiry to Laravel backend
    const response = await fetch(`${API_URL}/api/v1/enquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        customer_name: name,
        email,
        phone,
        message: [
          company ? `Company: ${company}` : "",
          quantity ? `Quantity: ${quantity}` : "",
          product ? `Product: ${product}` : "",
          message || "",
        ]
          .filter(Boolean)
          .join("\n"),
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("[quote API] Backend error:", err);
      return NextResponse.json(
        { error: "Failed to submit enquiry. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    console.error("[quote API error]", err);
    return NextResponse.json(
      { error: "Failed to submit enquiry. Please try again." },
      { status: 500 }
    );
  }
}
