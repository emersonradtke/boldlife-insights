/**
 * submitSurvey - Endpoint para coleta de dados de pesquisa via JSON (API externa)
 *
 * Permite que plataformas externas submetam respostas de pesquisa diretamente via API.
 *
 * Payload esperado (POST /functions/submitSurvey):
 * {
 *   "secret_key": "SEU_SECRET_KEY",
 *   "full_name": "João Silva",
 *   "email": "joao@email.com",
 *   "phone": "11999990000",           // opcional
 *   "is_associate": true,
 *   "associate_code": "BL-10042",     // obrigatório se is_associate = true
 *   "desired_brands": ["Nike", "Apple"],  // array de strings
 *   "desired_products": "Tênis esportivos e eletrônicos",
 *   "satisfaction_rating": 5,          // número de 1 a 5
 *   "comments": "Ótima plataforma!",   // opcional
 *   "external_platform": "minha-plataforma"  // opcional
 * }
 *
 * Resposta:
 * { "success": true, "id": "...", "message": "Resposta registrada com sucesso" }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // GET: Return the expected JSON schema for documentation
  if (req.method === "GET") {
    return Response.json({
      description: "Bold Life — Endpoint de coleta de pesquisa de opinião via JSON",
      method: "POST",
      endpoint: "/functions/submitSurvey",
      required_fields: {
        secret_key: "string — chave compartilhada de autenticação",
        full_name: "string — nome completo do respondente",
        email: "string — e-mail do respondente",
        is_associate: "boolean — se é associado Bold Life",
      },
      optional_fields: {
        phone: "string — telefone (ex: 11999990000)",
        associate_code: "string — código do associado (ex: BL-10042)",
        desired_brands: "array<string> — marcas desejadas na plataforma",
        desired_products: "string — descrição de produtos desejados",
        satisfaction_rating: "number — nota de 1 a 5",
        comments: "string — comentários adicionais",
        external_platform: "string — identificador da plataforma de origem",
      },
      example_payload: {
        secret_key: "boldlife-survey-2024",
        full_name: "João Silva",
        email: "joao@email.com",
        phone: "11999990000",
        is_associate: true,
        associate_code: "BL-10042",
        desired_brands: ["Nike", "Apple", "Samsung"],
        desired_products: "Tênis esportivos e eletrônicos",
        satisfaction_rating: 5,
        comments: "Ótima plataforma, parabéns!",
        external_platform: "minha-plataforma",
      },
    }, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Use GET (documentação) ou POST (envio)." }, {
      status: 405,
      headers: corsHeaders,
    });
  }

  const body = await req.json();
  const { secret_key, full_name, email, phone, is_associate, associate_code,
          desired_brands, desired_products, satisfaction_rating, comments, external_platform } = body;

  // Auth
  const expectedSecret = Deno.env.get("SURVEY_SECRET_KEY") || "boldlife-survey-2024";
  if (secret_key !== expectedSecret) {
    return Response.json({ error: "Chave de autenticação inválida." }, {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Validate required
  if (!full_name || !email) {
    return Response.json({ error: "full_name e email são obrigatórios." }, {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (satisfaction_rating !== undefined && (satisfaction_rating < 1 || satisfaction_rating > 5)) {
    return Response.json({ error: "satisfaction_rating deve ser entre 1 e 5." }, {
      status: 400,
      headers: corsHeaders,
    });
  }

  const base44 = createClientFromRequest(req);

  const record = await base44.asServiceRole.entities.SurveyResponse.create({
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || "",
    is_associate: Boolean(is_associate),
    associate_code: is_associate ? (associate_code?.trim() || "") : "",
    desired_brands: Array.isArray(desired_brands) ? desired_brands : [],
    desired_products: desired_products?.trim() || "",
    satisfaction_rating: satisfaction_rating ? Number(satisfaction_rating) : null,
    comments: comments?.trim() || "",
  });

  return Response.json({
    success: true,
    id: record.id,
    message: "Resposta de pesquisa registrada com sucesso.",
    submitted_at: new Date().toISOString(),
    source: external_platform || "api",
  }, { headers: corsHeaders });
});