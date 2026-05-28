import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RequestEmailChangeDto {
  @IsEmail()
  newEmail: string;
}

export class ConfirmEmailChangeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class RequestPasswordChangeDto {
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @IsString()
  @MinLength(8)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class ConfirmPasswordChangeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  lastname?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  language?: string;
}

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  notifyOnFollow?: boolean;

  @IsOptional()
  notifyOnLike?: boolean;

  @IsOptional()
  notifyOnComment?: boolean;
}

export class DeleteAccountDto {
  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsNotEmpty()
  type: 'deactivate' | 'delete';
}
