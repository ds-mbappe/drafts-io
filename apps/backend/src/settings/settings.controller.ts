import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/auth/auth.decorator';
import { JwtGuard } from 'src/auth/jwt.guard';
import { JwtPayload } from 'src/types';
import { SettingsService } from './settings.service';
import {
  ConfirmEmailChangeDto,
  ConfirmPasswordChangeDto,
  DeleteAccountDto,
  RequestEmailChangeDto,
  RequestPasswordChangeDto,
  UpdateNotificationPreferencesDto,
  UpdateProfileDto,
} from './dto/settings.dto';

@Controller('settings')
@UseGuards(JwtGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('me')
  getMe(@User() user: JwtPayload) {
    return this.settingsService.getMe(user.sub);
  }

  @Get('username/check')
  checkUsername(
    @User() user: JwtPayload,
    @Query('username') username: string,
  ) {
    return this.settingsService.checkUsername(user.sub, username);
  }

  @Patch('profile')
  updateProfile(@User() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.settingsService.updateProfile(user.sub, dto);
  }

  @Post('email/request')
  requestEmailChange(
    @User() user: JwtPayload,
    @Body() dto: RequestEmailChangeDto,
  ) {
    return this.settingsService.requestEmailChange(user.sub, dto);
  }

  @Post('email/confirm')
  confirmEmailChange(
    @User() user: JwtPayload,
    @Body() dto: ConfirmEmailChangeDto,
  ) {
    return this.settingsService.confirmEmailChange(user.sub, dto);
  }

  @Post('password/request')
  requestPasswordChange(
    @User() user: JwtPayload,
    @Body() dto: RequestPasswordChangeDto,
  ) {
    return this.settingsService.requestPasswordChange(user.sub, dto);
  }

  @Post('password/confirm')
  confirmPasswordChange(
    @User() user: JwtPayload,
    @Body() dto: ConfirmPasswordChangeDto,
  ) {
    return this.settingsService.confirmPasswordChange(user.sub, dto);
  }

  @Get('notifications')
  getNotificationPreferences(@User() user: JwtPayload) {
    return this.settingsService.getNotificationPreferences(user.sub);
  }

  @Patch('notifications')
  updateNotificationPreferences(
    @User() user: JwtPayload,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.settingsService.updateNotificationPreferences(user.sub, dto);
  }

  @Delete('account')
  deleteAccount(@User() user: JwtPayload, @Body() dto: DeleteAccountDto) {
    return this.settingsService.deleteAccount(user.sub, dto);
  }
}
