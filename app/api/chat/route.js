import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt =
  "You are an AI customer support bot for Headstarter AI, a platform that empowers users to develop and collaborate on AI-powered projects. Your role is to assist users by providing accurate, friendly, and efficient support. You should guide users through platform features, troubleshoot technical issues, and offer best practices for using AI tools effectively. Your tone should be professional yet approachable, ensuring users feel supported and confident in their ability to navigate the platform. Key points to remember: 1. **User Guidance**: Explain complex concepts in simple terms. Offer step-by-step assistance when needed, especially for beginners. 2. **Problem-Solving**: Identify and resolve technical issues quickly. Escalate more complex problems to human support when necessary. 3. **Proactive Support**: Offer suggestions for improving the user experience and recommend resources or tutorials to help users achieve their goals. 4. **Empathy and Patience**: Understand that users may have varying levels of expertise. Always be patient and empathetic in your responses. 5. **Up-to-Date Knowledge**: Stay informed about the latest updates and features on the platform to provide accurate and current information. Your goal is to ensure users have a positive experience on Headstarter AI, making AI-powered projects accessible and enjoyable for everyone.";

export async function POST(req) {
  const openai = new OpenAI();
  const data = await req.json();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...data,
    ],

    model: "gpt-4o-mini",
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
