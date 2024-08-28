// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  ValidationPipe,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';
import { RegisterDto } from './dto/register.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('validate')
  @UseGuards(JwtGuard) // Protects route with guard
  async validateUserSession(@Req() request: Request) {
    const userId = request['user'].sub;
    return this.authService.validateUser(userId);
  }

  @Post('register')
  async register(
    @Body(new ValidationPipe({ whitelist: true })) registerDto: RegisterDto,
  ) {
    return this.authService.register(
      registerDto.user_name,
      registerDto.password,
    );
  }

  @Post('login')
  async login(
    @Body('user_name') user_name: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(user_name, password);
  }

  @Post('refresh')
  async refreshToken(@Headers('x-refresh-token') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    return this.authService.refreshTokens(refreshToken);
  }
}
