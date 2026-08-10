import { StructuredWorkoutRecommendation } from './agent.types';

export class ResponseParser {
  static parse(rawText: string): { replyText: string; structuredData: StructuredWorkoutRecommendation | null } {
    let structuredData: StructuredWorkoutRecommendation | null = null;
    let replyText = rawText;

    // Match JSON codeblock ```json ... ```
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        structuredData = JSON.parse(jsonMatch[1]);
        // Remove raw JSON codeblock from human reply text for clean display
        replyText = rawText.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
      } catch (e) {
        console.warn('[ResponseParser] Failed to parse structured JSON block from AI output');
      }
    }

    return {
      replyText: replyText || rawText,
      structuredData,
    };
  }
}
