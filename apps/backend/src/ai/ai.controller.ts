import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { JwtPayload } from 'src/types';
import { Response } from 'express';

@Controller('ai')
@UseGuards(JwtGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(
    @Body()
    body: { messages: { role: 'user' | 'assistant'; content: string }[] },
    @User() user: JwtPayload,
    @Res() res: Response,
  ) {
    return this.aiService.chat(body.messages, user.sub, res);
  }

  @Post('translate')
  async translate(@Body() body: { text: string; language: string }) {
    const translatedText = await this.aiService.translate(
      body.text,
      body.language,
    );

    return { translatedText };
  }

  @Post('translate/stream')
  async translateStream(
    @Body() body: { text: string; language: string },
    @Res() res: Response,
  ) {
    return this.aiService.translateStream(body.text, body.language, res);
  }

  @Post('translate/batch')
  async translateBatch(@Body() body: { texts: string[]; language: string }) {
    const texts = await this.aiService.translateBatch(
      body.texts,
      body.language,
    );

    return { texts };
  }
}
