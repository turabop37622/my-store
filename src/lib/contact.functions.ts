import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API_URL = "https://my-store-production-ed96.up.railway.app";

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  subject: z.string().min(2).max(200),
  message: z.string().min(5).max(2000),
});

export const submitContactForm = createServerFn({ method: "POST" })
  .inputValidator((input) => ContactSchema.parse(input))
  .handler(async ({ data }) => {
    const res = await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Could not submit your message. Please try again.");
    return { success: true };
  });