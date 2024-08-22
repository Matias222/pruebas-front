// pages/_middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || "";

interface DecodedToken {
  user_id: string; // Adjusted type as needed
  rol: string;
}

export async function middleware(req: NextRequest) {

  try {
    const token = req.cookies.get('auth');
    const valor = token?.value || "";
    let rol = "";
    
    try {
      const { payload } = await jwtVerify(
        valor,
        new TextEncoder().encode(JWT_SECRET)
      );
      const decoded = payload as unknown as DecodedToken;
      rol = decoded.rol;
    } catch (error) {
      rol = "Invalido";
      //console.log(error);
      //console.log("El token no existe");
    }

    if (!token || rol === "Invalido") {
      if (req.nextUrl.pathname.startsWith('/adoptante') || req.nextUrl.pathname.startsWith('/voluntario') || req.nextUrl.pathname.startsWith('/administrador')) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
      return NextResponse.next();
    } else { // El token existe y es valido
      
      if(req.nextUrl.pathname.startsWith("/login")) return NextResponse.next();

      if (rol === "adoptante" && (req.nextUrl.pathname.startsWith('/voluntario') || req.nextUrl.pathname.startsWith('/adminitrador'))) {
        return NextResponse.redirect(new URL('/adoptante', req.url));
      } else if (rol === "voluntario" && (req.nextUrl.pathname.startsWith('/adoptante') || req.nextUrl.pathname.startsWith('/adminitrador'))) {
        return NextResponse.redirect(new URL('/voluntario', req.url));
      }else if (rol === "administrador" && (req.nextUrl.pathname.startsWith('/adoptante') || req.nextUrl.pathname.startsWith('/voluntario'))) {
        return NextResponse.redirect(new URL('/administrador', req.url));
      }
    }

  } catch (error) {
    console.log("Error en middleware");
    return NextResponse.redirect(new URL('/login', req.url));
  }

}
