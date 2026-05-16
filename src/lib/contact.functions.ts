import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "./db";

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  subject: z.string().min(2).max(200),
  message: z.string().min(5).max(2000),
});

export const submitContactForm = createServerFn({ method: "POST" })
  .inputValidator((input) => ContactSchema.parse(input))
  .handler(async ({ data }) => {
    const db = await getDb();

    const result = await db.collection("contact_messages").insertOne({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: "unread",
      created_at: new Date(),
    });

    if (!result.acknowledged) {
      throw new Error("Could not submit your message. Please try again.");
    }

    return { success: true };
  });
