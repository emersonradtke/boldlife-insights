/**
 * surveyLogin - Endpoint de autenticação via JSON para plataforma externa
 *
 * Recebe dados do associado de outra plataforma e retorna um token de sessão
 * que pré-preenche o formulário de pesquisa de opinião.
 *
 * Payload esperado (POST /functions/surveyLogin):
 * {
 *   "associate_code": "BL-10042",
 *   "full_name": "João Silva",
 *   "email": "joao@email.com",
 *   "phone": "11999990000",       // opcional
 *   "external_platform": "minha-plataforma",  // opcional, identifica origem
 *   "secret_key": "SEU_SECRET_KEY"   // chave compartilhada para autenticação
 * }
 *
 * Resposta de sucesso:
 * {
 *   "success": true,
 *   "redirect_url": "/pesquisa?token=eyJhbGciOiJIUzI1NiJ9...",
 *   "associate_data": { "full_name": "...", "email": "...", ... },
 *   "token": "eyJhbGciOiJIUzI1NiJ9..."
 * }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function encodeBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function decodeBase64(str) {
  return decodeURIComponent(escape(atob(str)));
}

Deno.serve(async (req) => {
  // Allow CORS for external platforms
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Método não permitido. Use POST." }, {
      status: 405,
      headers: corsHeaders,
    });
  }

  const body = await req.json();
  const { associate_code, full_name, email, phone, external_platform, secret_key } = body;

  // Validate secret key
  const expectedSecret = Deno.env.get("SURVEY_SECRET_KEY") || "boldlife-survey-2024";
  if (secret_key !== expectedSecret) {
    return Response.json({ error: "Chave de autenticação inválida." }, {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Validate required fields
  if (!associate_code || !full_name || !email) {
    return Response.json({
      error: "Campos obrigatórios ausentes: associate_code, full_name, email"
    }, { status: 400, headers: corsHeaders });
  }

  // Build associate payload
  const associatePayload = {
    associate_code: associate_code.trim(),
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || "",
    is_associate: true,
    external_platform: external_platform || "unknown",
    logged_at: new Date().toISOString(),
  };

  // Encode as base64 token (simple, not cryptographic — use a proper JWT for production)
  const token = encodeBase64(JSON.stringify(associatePayload));

  // Build redirect URL for the survey form
  const appBaseUrl = Deno.env.get("APP_BASE_URL") || "https://app.base44.com";
  const redirectUrl = `${appBaseUrl}?token=${token}`;

  return Response.json({
    success: true,
    message: "Autenticação realizada com sucesso. Redirecione o usuário para redirect_url.",
    redirect_url: redirectUrl,
    token: token,
    associate_data: associatePayload,
  }, { headers: corsHeaders });
});