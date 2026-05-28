import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { User } from 'src/auth/auth.decorator';
import { JwtPayload } from 'src/types';

type UpdateUserBody = UpdateUserDto & { formData?: UpdateUserDto };

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me/profile')
  getMyProfile(@User() user: JwtPayload) {
    return this.userService.getMyProfile(user.sub);
  }

  @Get(':username/profile')
  getUserProfile(
    @Param('username') username: string,
    @User() user: JwtPayload,
  ) {
    return this.userService.getUserByUsername(username, user.sub);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserBody) {
    const data = body?.formData ?? body;
    return this.userService.updateUser(id, data);
  }
}
