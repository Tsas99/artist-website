import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 
'http://localhost:3001';

export async function POST(request:Request) {
    try {
        const body = await request.json();
        const response = await fetch (
            `${API_URL}/auth/login`,
            {
                method:'POST',
                headers: {
                    'Content-Type':'application/json',
                },
                body: JSON.stringify(body),
                cache:'no-store',
            },
        );
        if (!response.ok) {
            if (response.status === 401) {
                return NextResponse.json(
                    {
                        message: 'Invalid email or password'

                    },
                    {
                        status: 401,
                    },
                );
            }
            return NextResponse.json(
                {
                    message: 'Login failed.'
                },
            );
        }
        const data = await response.json();
        const result = NextResponse.json({
            admin: data.admin,
        });
        result.cookies.set({
            name: 'admin_access_token',
            value: data.accessToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 8 ,

        });
        return result ;
    } catch (error) {
        console.error(
            'Admin login error:',
            error,
        );
        return NextResponse.json(
            {
                message: 'Login failed.' ,
            },
            {
                status: 500,
            },   
        );
    }
}