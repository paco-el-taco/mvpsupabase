"use client";

import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient"; 
import { User } from "@supabase/supabase-js"; // 👈 Importamos el tipo real
import Link from "next/link";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); // 👈 Tipado correcto sin usar 'any'

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-black`}>
        
        {user && (
          <nav className="bg-amber-50 border-b border-amber-100 p-4 flex gap-6 justify-center shadow-sm">
            <Link 
              href="/mvp" 
              className="text-amber-900 font-semibold hover:text-amber-700 transition-colors hover:underline"
            >
              Consola MVP (Productos/Categorías)
            </Link>
            
            <Link 
              href="/user" 
              className="text-amber-900 font-semibold hover:text-amber-700 transition-colors hover:underline"
            >
              Mi Perfil Admin
            </Link>

            {user.email === "tu_nuevo_correo@dominio.com" && (
              <Link 
                href="/admin" 
                className="text-red-700 font-bold hover:text-red-900 bg-red-50 px-2 py-0.5 rounded border border-red-200 transition-colors"
              >
                🛡️ Panel Maestro
              </Link>
            )}
          </nav>
        )}

        <main>{children}</main>
        
      </body>
    </html>
  );
}