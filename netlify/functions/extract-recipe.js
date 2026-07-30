const PROMPT = `Du bekommst das Foto einer Rezeptseite aus einem Kochbuch. Extrahiere die Informationen und antworte AUSSCHLIESSLICH mit validem JSON in genau diesem Format, ohne Markdown-Codeblock, ohne zusaetzlichen Text:
{
  "title": "string",
  "servings": "string oder null",
  "time": "string oder null",
  "ingredients": ["string", ...],
  "instructions": ["string", ...]
}
Wenn ein Feld nicht erkennbar ist, nutze null bzw. eine leere Liste. Behalte die Sprache des Originaltexts bei.`;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY ist auf dem Server nicht gesetzt" }) };
  }

  let image, mediaType;
  try {
    ({ image, mediaType } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Ungueltiger Request-Body" }) };
  }
  if (!image || !mediaType) {
    return { statusCode: 400, body: JSON.stringify({ error: "image und mediaType erforderlich" }) };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return { statusCode: response.status, body: JSON.stringify({ error: "Anthropic API Fehler", detail }) };
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((c) => c.type === "text");
    const raw = textBlock ? textBlock.text : "";
    const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");

    let recipe;
    try {
      recipe = JSON.parse(cleaned);
    } catch {
      return { statusCode: 502, body: JSON.stringify({ error: "Antwort konnte nicht als JSON gelesen werden", raw }) };
    }

    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(recipe) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
