function buildPrompt(title, ingredients, steps) {
  return `Du bekommst Titel, Zutatenliste und Zubereitungsschritte eines Rezepts. Schaetze eine grobe gesundheitliche Einordnung auf einer Skala von 1 (sehr ungesund) bis 10 (sehr gesund) ein, basierend auf Gemuese-/Vollwertanteil, Zucker-/Fett-/Salzgehalt, verarbeiteten Zutaten und Zubereitungsart (gebraten/frittiert vs. gedaempft/gebacken/roh). Antworte AUSSCHLIESSLICH mit validem JSON in genau diesem Format, ohne Markdown-Codeblock, ohne zusaetzlichen Text:
{
  "score": <Zahl 1-10>,
  "reason": "<1-2 kurze Saetze auf Deutsch, die die Einschaetzung begruenden>"
}

Titel: ${title || "Ohne Titel"}
Zutaten:
${(ingredients || []).map((i) => "- " + i).join("\n")}
Zubereitung:
${(steps || []).map((s, i) => (i + 1) + ". " + s).join("\n")}`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY ist auf dem Server nicht gesetzt" }) };
  }

  let title, ingredients, steps;
  try {
    ({ title, ingredients, steps } = JSON.parse(event.body));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Ungueltiger Request-Body" }) };
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
        max_tokens: 300,
        messages: [{ role: "user", content: buildPrompt(title, ingredients, steps) }],
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

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      return { statusCode: 502, body: JSON.stringify({ error: "Antwort konnte nicht als JSON gelesen werden", raw }) };
    }

    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
