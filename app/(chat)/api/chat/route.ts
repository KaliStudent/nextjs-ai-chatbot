import { NextResponse } from "next/server";
import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import { auth } from "@/app/(auth)/auth";
import { getMessageCountByUserId, saveMessages, getChatById } from "@/lib/db/queries";
import { postRequestBodySchema, type PostRequestBody } from "./schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await req.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { id, message } = requestBody;

  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messageCount = await getMessageCountByUserId({ id: session.user.id, differenceInHours: 24 });
  if (messageCount > 1000) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  await saveMessages({
    messages: [
      {
        chatId: id,
        id: message.id,
        role: "user",
        parts: message.parts,
        attachments: [],
        createdAt: new Date(),
      },
    ],
  });

  const userText = message.parts[0]?.content?.toLowerCase() || "";

  // --- Rule-based overrides ---
  if (userText.includes("resume")) {
    return NextResponse.json({
      id: "custom-resume-answer",
      role: "assistant",
      parts: [
        {
          content:
            "Brian Jarvis' resume summary:\n- Digital forensics, IT security, software development\n- Web design, coding, UI/UX, business development\n- Contact: hireme@bjarvis.io\n- LinkedIn: https://www.linkedin.com/in/brian-jarvis-in-itsec/",
        },
      ],
    });
  }

  if (userText.includes("contact") || userText.includes("email")) {
    return NextResponse.json({
      id: "custom-contact-answer",
      role: "assistant",
      parts: [
        {
          content:
            "You can reach Brian Jarvis via email: hireme@bjarvis.io or LinkedIn: https://www.linkedin.com/in/brian-jarvis-in-itsec/",
        },
      ],
    });
  }

  const chat = await getChatById({ id });
  if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  // --- System prompt injection ---
  const systemMessage = {
    role: "system",
    content: `
You are a helpful assistant that knows Brian Jarvis' professional background:
- Name: Brian Jarvis
- Location: Dallas, TX
- Background: Digital forensics, IT security, software development
- Skills: Web design, coding, UI/UX, business development
- Contact: hireme@bjarvis.io
- LinkedIn: https://www.linkedin.com/in/brian-jarvis-in-itsec/

Instructions:
- If asked about Brian’s resume, summarize above info.
- If asked for contact, only provide email or LinkedIn.
- Otherwise behave as a normal assistant.
`,
  };

  const messagesForAI = [
    systemMessage,
    ...message.parts.map((part) => ({ role: "user", content: part.content })),
  ];

  // --- OpenAI streaming ---
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: messagesForAI,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
