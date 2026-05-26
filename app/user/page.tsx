"use client";

// 👆 Este componente se ejecuta en el navegador (cliente)
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

interface AdminProfile {
  id: string;
  nombre: string;
  correo: string;
  telefono: string | null;
}

export default function AdminProfilePage() {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [nombre, setNombre] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Nota: Dejamos el estado message si lo usas en otra parte de tu app
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  // 🚀 1. Cargar la información del administrador logueado
  const fetchAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMensaje("⚠️ No hay sesión activa.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("admin")
      .select("id, nombre, correo, telefono")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error(error.message);
      setMensaje("❌ Error al cargar perfil de administrador");
    } else if (data) {
      setAdmin(data);
      setNombre(data.nombre);
      setTelefono(data.telefono || "");
    }
    setLoading(false);
  };

  // ⚙️ Actualizar los datos del administrador
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje(null);
    if (!admin) return;

    const { error } = await supabase
      .from("admin")
      .update({ nombre, telefono })
      .eq("id", admin.id);

    if (error) {
      setMensaje("❌ Error al actualizar: " + error.message);
    } else {
      setMensaje("✅ Perfil de Administrador actualizado");
      fetchAdmin(); // 🔄 Volvemos a cargar los datos actualizados
    }
  };

  // 🚪 Función para cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); 
  };

  // 🌀 Hook 1: Cargar datos iniciales del perfil
  useEffect(() => {
    fetchAdmin();
  }, []);

  // 🌀 Hook 2: Protección de ruta (Traído a la parte superior antes de cualquier return)
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        // ❌ No hay usuario logueado → redirige a login
        router.push("/login");
      } else {
        // ✅ Usuario logueado, seguimos con la página
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  // ⏳ 3. CONDICIÓN DE RENDERIZADO (Siempre abajo de todos los hooks)
  if (loading) {
    return <p className="text-center mt-10 text-black">⏳ Cargando perfil corporativo...</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow bg-white text-black">
      <h1 className="text-2xl font-bold mb-4 text-center text-amber-800">
        Perfil del Administrador
      </h1>
      
      {admin ? (
        <form onSubmit={handleUpdate} className="flex flex-col gap-4 text-black">
          <label className="text-sm font-semibold text-amber-950 -mb-2">Nombre Completo:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="border p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          
          <label className="text-sm font-semibold text-amber-950 -mb-2">Teléfono de Soporte:</label>
          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="border p-2 rounded text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          
          <label className="text-sm font-semibold text-amber-950 -mb-2">Email Corporativo:</label>
          <input
            type="email"
            value={admin.correo}
            readOnly
            className="border p-2 rounded bg-amber-50/50 text-gray-600 cursor-not-allowed"
          />
          
          <button type="submit" className="bg-amber-600 text-white py-2 rounded font-semibold hover:bg-amber-700 transition-colors">
            Actualizar Datos
          </button>
        </form>
      ) : (
        <p className="text-center text-gray-600">{mensaje}</p>
      )}

      <button
        onClick={handleLogout}
        className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded mt-4 w-full font-semibold transition-colors"
      >
        Cerrar sesión
      </button>

      {mensaje && admin && (
        <p className="mt-4 text-center text-sm font-medium text-amber-900">{mensaje}</p>
      )}
    </div>
  );
}