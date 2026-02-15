/**
 * Module for MCP transport route
 * Temporarily disabled - awaiting package fix
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { NextRequest, NextResponse } from "next/server";

// MCP route - temporarily disabled
export async function GET(request: NextRequest) {
  return NextResponse.json({
    error: "MCP endpoint temporarily disabled",
    message: "This endpoint is under maintenance"
  }, { status: 503 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    error: "MCP endpoint temporarily disabled",
    message: "This endpoint is under maintenance"
  }, { status: 503 });
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    error: "MCP endpoint temporarily disabled",
    message: "This endpoint is under maintenance"
  }, { status: 503 });
}
