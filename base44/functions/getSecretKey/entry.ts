import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const secretKey = Deno.env.get("SURVEY_SECRET_KEY") || "";
    return Response.json({ secret_key: secretKey });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});