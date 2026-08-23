import { NextRequest, NextResponse } from "next/server";

// Fallback to local default port 8000 if no environment variable is set
const CHATBOT_BACKEND_URL = process.env.CHATBOT_BACKEND_URL || "http://localhost:8000";

/**
 * GET handler: Queries the backend health check to display connection status.
 */
export async function GET() {
  try {
    const response = await fetch(`${CHATBOT_BACKEND_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Keep timeout short to detect offline API quickly
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: "warning", message: `Backend returned status ${response.status}` },
        { status: 200 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chatbot API Proxy health check error:", error);
    return NextResponse.json(
      {
        status: "offline",
        message: "Portfolio API is offline. Ensure it is running on http://localhost:8000.",
      },
      { status: 200 }
    );
  }
}

/**
 * POST handler: Forwards user questions to the Groq-powered FastAPI backend.
 */
export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Invalid request. The 'question' parameter must be a non-empty string." },
        { status: 400 }
      );
    }

    const response = await fetch(`${CHATBOT_BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
      signal: AbortSignal.timeout(20000), // Allow up to 20s for LLM processing
    });

    if (response.status === 530) {
      // Configuration missing (Groq API Key is unconfigured)
      return NextResponse.json(
        {
          answer: "I'm sorry, but my developer hasn't configured the Groq API key in the backend `.env` file yet. Please set `GROQ_API_KEY` to enable chat.",
        },
        { status: 200 }
      );
    }

    if (response.status === 500) {
      // Internal Server Error (Missing/empty portfolio_data.json)
      return NextResponse.json(
        {
          answer: "I'm sorry, but I encountered an internal error. It looks like the portfolio data database might be missing or unreadable on the server.",
        },
        { status: 200 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          answer: `I'm having trouble retrieving an answer. (Backend returned error: ${response.status} - ${errorText || "Unknown Error"})`,
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Chatbot API Proxy request error:", error);
    
    // Distinguish timeout vs connection failure
    const isTimeout = error.name === "TimeoutError";
    const errorMessage = isTimeout
      ? "The request to the AI service timed out. Please try asking again."
      : "I cannot connect to my AI server. Please make sure the portfolio chatbot backend is running at http://localhost:8000.";

    return NextResponse.json(
      {
        answer: errorMessage,
      },
      { status: 200 }
    );
  }
}
