// src/auth/auth.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../common/password.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) { }

  async validateUser(userId: number): Promise<any> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user; // Return the user data
  }

  async login(userName: string, password: string) {
    console.log(userName, password);
    const user = await this.usersService.findByUsername(userName);

    console.log(user);
    if (
      user &&
      (await this.passwordService.comparePassword(password, user.password))
    ) {
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: userName,
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async register(userName: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(userName);
    if (user) {
      throw new ConflictException('Username already exists');
    }
    console.log(userName, password);
    try {
      const user = await this.usersService.create({
        user_name: userName,
        password: password,
        is_admin: false,
      });

      return {
        message: `User ${user.user_name} created successfully`,
      };
    } catch (error) {
      throw new BadRequestException(`Registration failed: ${error.message}`);
    }
  }

  async refreshTokens(refreshToken: string) {
    console.log(refreshToken);
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      console.log(payload);
      const user_id = payload.sub;

      const user = await this.usersService.findOne(user_id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      };
    } catch (_) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateAccessToken(user: any): string {
    const payload = { user_name: user.user_name, sub: user.id };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: `${this.configService.get<string>('JWT_EXPIRATION_TIME')}m`,
    });
  }

  private generateRefreshToken(user: any): string {
    const payload = { user_name: user.user_name, sub: user.id };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: `${this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME')}d`,
    });
  }
}
