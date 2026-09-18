import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";

import type { Request } from 'express';

type AuthenticatedRequest = Request & {
    user: {
        sub: number;
        email: string
    };
};


@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}
    @Post('login')
    login (
        @Body() LoginDto : LoginDto,
    ) {
        return this.authService.login(LoginDto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(
        @Req() request: AuthenticatedRequest, 
    ) {
        return {
            id: request.user.sub,
            email: request.user.email,
        };
    }

   

}