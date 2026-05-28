import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TtsService } from './tts.service';
import { JwtGuard } from 'src/auth/jwt.guard';

@Controller('tts')
@UseGuards(JwtGuard)
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  /**
   * POST /api/tts/speak
   *
   * Body: { draftId: string, chunks: string[] }
   *   - draftId  — used as the cache partition key
   *   - chunks   — one plain-text string per document block, in document order
   *
   * Response: { chunks: TtsChunk[] }
   *   - Each TtsChunk: { audioBase64: string, words: { word, startMs, endMs }[] }
   *
   * The first call for a given (draftId, content) hits Google TTS.
   * All subsequent calls with the same text return the cached result instantly.
   */
  @Post('speak')
  async speak(
    @Body() body: { draftId: string; chunks: string[]; language?: string },
  ) {
    const chunks = await this.ttsService.speak(
      body.draftId,
      body.chunks,
      body.language,
    );
    return { chunks };
  }
}
