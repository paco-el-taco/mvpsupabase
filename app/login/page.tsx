"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Error al iniciar sesión: " + error.message);
      return;
    }

    if (data.user) { 
      setMessage(" Sesión de Administrador iniciada. Redirigiendo...");
      setTimeout(() => {
        router.push("/mvp");
      }, 1500);
    } else {
      setMessage("Usuario no encontrado.");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded-lg shadow bg-white text-black">
      <h1 className="text-xl font-bold mb-4 text-center text-amber-800">
        Panadería Santa Isabel - Acceso Admin
      </h1>
      
      <form onSubmit={handleLogin} className="flex flex-col gap-4 text-black">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        
        <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded font-semibold transition-colors">
          Ingresar al Panel
        </button>
      </form>
      
      {message && <p className="mt-4 text-center text-sm font-medium text-gray-700">{message}</p>}
    </div>
  );
}