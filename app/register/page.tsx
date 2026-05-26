"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [nombre, setNombre] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setMessage("❌ Error en registro: " + authError.message);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setMessage("⚠️ No se pudo obtener el ID del administrador.");
      return;
    }

    // Insertar en la nueva tabla 'admin'
    const { error: insertError } = await supabase
      .from("admin")
      .insert([
        {
          id: userId,
          nombre,
          correo: email,
          telefono,
        },
      ]);

    if (insertError) {
      setMessage("⚠️ Autenticado pero no guardado en la tabla admin: " + insertError.message);
      return;
    }

    setMessage("✅ ¡Administrador registrado correctamente! Revisa tu correo para confirmar cuenta.");
  };

  useEffect(() => {
const checkUser = async () => {
const { data } = await supabase.auth.getUser();
if (!data.user) {
// ✅ Usuario logueado, seguimos con la página
setLoading(false);
} else {
// ❌ No hay usuario logueado → redirige a login
router.push("/user");
}

};
checkUser();
}, [router]);
if (loading) return <p className="text-center mt-10">Verificando
sesión...</p>;

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 border rounded-lg shadow bg-white text-black">
      <h1 className="text-xl font-bold mb-4 text-center text-amber-800">
        Panadería Santa Isabel - Registro Admin
      </h1>

      <form onSubmit={handleRegister} className="flex flex-col gap-4 text-black">
        <input
          type="text"
          placeholder="Nombre del Administrador"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="border p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        <input
          type="tel"
          placeholder="Teléfono de contacto"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="border p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        <input
          type="password"
          placeholder="Contraseña de acceso"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        <button
          type="submit"
          className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded font-semibold transition-colors"
        >
          Registrar Administrador
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm font-medium text-gray-700">
          {message}
        </p>
      )}

      {/* 🔗 Enlace a la página de login */}
<p className="mt-4 text-center">
¿Ya tienes cuenta?{" "}
<button
onClick={() => router.push("/login")}
className="text-blue-600 underline"
>
Inicia sesión aquí
</button>
</p>
    </div>
  );
}