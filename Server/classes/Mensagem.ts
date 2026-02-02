/**
 * GoogleAIService - Interface com API do Google Gemini 1.5 Flash Lite
 * Gera conteúdo dinâmico usando IA (cartas de sorte/azar personalizadas)
 * Node 18+ com fetch nativo
 */

interface GenerateOptions {
  contents: string; // Prompt/instrução para a IA
}

/**
 * Classe GoogleAIService - Gerencia chamadas à API do Google Gemini
 * Responsável por gerar manchetes, cartas e mensagens do jogo usando IA
 */
export class GoogleAIService {
  // Chave API do Google Cloud (Gemini 1.5 Flash Lite)
  private static API_KEY = "AIzaSyBsZ5viV4CEfDlj-zkpzNZ6fjNcavZAtwI";

  // URL base para requisições à API Gemini
  private static URL =
    "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-lite:generateContent";

  /**
   * Gera conteúdo usando a IA Google Gemini
   * @param options - Objeto contendo o prompt/instrução
   * @returns Texto gerado pela IA
   * @throws Error se API_KEY não estiver configurada ou requisição falhar
   */
  public static async generateContent(
    options: GenerateOptions
  ): Promise<string> {
    if (!this.API_KEY) {
      throw new Error("GOOGLE_API_KEY não definida no ambiente");
    }

    try {
      // Faz requisição POST para a API Gemini
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

      // Valida resposta HTTP
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      // Parseia resposta JSON
      const data = await response.json();

      // ==================== EXTRAÇÃO DO TEXTO ====================
      // A IA retorna em estrutura aninhada: candidates[0].content.parts[0].text

      const candidates = data?.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("IA não retornou candidates");
      }

      // Extrai array de parts (pode conter texto, imagens, etc)
      const parts = candidates[0]?.content?.parts;
      if (!parts || parts.length === 0) {
        throw new Error("Resposta da IA sem conteúdo (parts vazio)");
      }

      // Busca a parte que contém texto
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
