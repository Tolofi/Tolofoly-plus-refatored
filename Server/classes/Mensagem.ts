// GoogleAIService.ts
// Node 18+ (fetch nativo)

interface GenerateOptions {
  contents: string;
}

export class GoogleAIService {
  private static API_KEY = "AIzaSyBsZ5viV4CEfDlj-zkpzNZ6fjNcavZAtwI";

  private static URL =
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-lite:generateContent";

  public static async generateContent(
    options: GenerateOptions
  ): Promise<string> {
    if (!this.API_KEY) {
      throw new Error("GOOGLE_API_KEY não definida no ambiente");
    }

    try {
      const response = await fetch(`${this.URL}?key=${this.API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: options.contents,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // ===== EXTRAÇÃO ROBUSTA DO TEXTO =====

      const candidates = data?.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("IA não retornou candidates");
      }

      const parts = candidates[0]?.content?.parts;
      if (!parts || parts.length === 0) {
        throw new Error("Resposta da IA sem conteúdo (parts vazio)");
      }

      const textPart = parts.find((p: any) => typeof p.text === "string");

      if (!textPart || !textPart.text) {
        throw new Error("IA respondeu, mas sem texto");
      }

      return textPart.text;
    } catch (error) {
      console.error("Erro ao gerar mensagem:", error);
      throw error;
    }
  }
}
