"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  nombre: string;
  correo: string;
  telefono: string | null;
}

interface Categoria {
  id: string;
  nombre: string;
}

interface Producto {
  id: string;
  nombre_producto: string;
  descripcion: string | null;
  estado: string;
  precio: number;
  imagen: string | null;
  creado_en: string;
  admin: any; // 👈 Cambiado a any para evitar conflictos de desestructuración con Supabase en Build
  categoria: any; // 👈 Cambiado a any
}

export default function AdminGlobalPanelPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [administradores, setAdministradores] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const verificarAdminMaestro = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data.user) {
          router.push("/login");
          return;
        } 
        
        if (data.user.email !== "tu_nuevo_correo@dominio.com") {
          router.push("/login");
          return;
        } 
        
        await Promise.all([fetchProductos(), fetchAdministradores()]);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    verificarAdminMaestro();
  }, [router]);

  const fetchProductos = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select(`
        id,
        nombre_producto,
        descripcion,
        estado,
        precio,
        imagen,
        creado_en,
        admin:admin!admin_id(id, nombre, correo, telefono),
        categoria:categorias!categoria_id(id, nombre)
      `)
      .order("creado_en", { ascending: false });

    if (error) {
      setMessage("❌ Error al cargar productos globales");
    } else if (data) {
      setProductos(data as any[]);
    }
  };

  const fetchAdministradores = async () => {
    const { data, error } = await supabase
      .from("admin")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      setMessage("❌ Error al cargar administradores");
    } else if (data) {
      setAdministradores(data);
    }
  };

  const actualizarProductoCompleto = async (id: string, nuevoNombre: string, nuevaDesc: string | null, nuevoPrecio: number, nuevoEstado: string) => {
    const { error } = await supabase
      .from("productos")
      .update({ 
        nombre_producto: nuevoNombre,
        descripcion: nuevaDesc,
        precio: nuevoPrecio, 
        estado: nuevoEstado 
      })
      .eq("id", id);

    if (error) {
      setMessage("❌ Error al actualizar producto: " + error.message);
    } else {
      setMessage("✅ Producto e inventario actualizados correctamente");
      fetchProductos(); 
    }
  };

  const actualizarAdminLista = async (id: string, nuevoNombre: string, nuevoTelefono: string | null) => {
    const { error } = await supabase
      .from("admin")
      .update({ nombre: nuevoNombre, telefono: nuevoTelefono })
      .eq("id", id);

    if (error) {
      setMessage("❌ Error al actualizar administrador: " + error.message);
    } else {
      setMessage("✅ Datos de administrador actualizados");
      fetchAdministradores();
      fetchProductos(); 
    }
  };

  const handleProductoChange = (id: string, campo: 'nombre_producto' | 'descripcion' | 'precio' | 'estado', value: string) => {
    setProductos(prev => prev.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          [campo]: campo === 'precio' ? (parseFloat(value) || 0) : value 
        };
      }
      return p;
    }));
  };

  const handleAdminDataChange = (id: string, campo: 'nombre' | 'telefono', value: string) => {
    setAdministradores(prev => prev.map(a => a.id === id ? { ...a, [campo]: value } : a));
  };

  const obtenerNombreAdmin = (adm: any) => {
    if (!adm) return "Desconocido";
    if (Array.isArray(adm)) return adm[0]?.nombre ?? "Desconocido";
    return adm.nombre ?? "Desconocido";
  };

  const obtenerNombreCategoria = (cat: any) => {
    if (!cat) return "Sin categoría";
    if (Array.isArray(cat)) return cat[0]?.nombre ?? "Sin categoría";
    return cat.nombre ?? "Sin categoría";
  };

  if (loading) return <p className="text-center mt-10 text-black font-semibold">⏳ Verificando credenciales de Súper Admin...</p>;

  return (
    <div className="max-w-7xl mx-auto mt-10 p-6 space-y-10 text-black">
      <h1 className="text-3xl font-bold text-center text-amber-800">
        Panel de Control Maestro - Santa Isabel
      </h1>
      
      {message && (
        <p className="text-center bg-amber-50 p-2 rounded border border-amber-200 font-medium text-amber-950">
          {message}
        </p>
      )}

      <section className="bg-white p-6 border rounded-lg shadow">
        <h2 className="text-2xl font-bold text-amber-900 mb-4">Inventario General de Productos</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border text-left text-sm">
            <thead>
              <tr className="bg-amber-100 text-amber-950">
                <th className="border p-2">Registrado Por</th>
                <th className="border p-2">Categoría</th>
                <th className="border p-2">Nombre del Producto</th>
                <th className="border p-2">Descripción / Notas</th>
                <th className="border p-2">Estado</th>
                <th className="border p-2">Precio ($CO)</th>
                <th className="border p-2">Imagen</th>
                <th className="border p-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => (
                <tr key={prod.id} className="hover:bg-amber-50/50">
                  <td className="border p-2 font-medium">{obtenerNombreAdmin(prod.admin)}</td>
                  <td className="border p-2">{obtenerNombreCategoria(prod.categoria)}</td>
                  
                  <td className="border p-2">
                    <input
                      type="text"
                      value={prod.nombre_producto}
                      onChange={(e) => handleProductoChange(prod.id, 'nombre_producto', e.target.value)}
                      className="border p-1 w-full text-black font-semibold rounded focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </td>

                  <td className="border p-2">
                    <input
                      type="text"
                      value={prod.descripcion ?? ""}
                      placeholder="Sin descripción"
                      onChange={(e) => handleProductoChange(prod.id, 'descripcion', e.target.value)}
                      className="border p-1 w-full text-black rounded text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </td>

                  <td className="border p-2">
                    <select
                      value={prod.estado}
                      onChange={(e) => handleProductoChange(prod.id, 'estado', e.target.value)}
                      className="border p-1 rounded text-black bg-white focus:ring-1 focus:ring-amber-500 outline-none"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="por_encargo">Por Encargo</option>
                      <option value="agotado">Agotado</option>
                    </select>
                  </td>

                  <td className="border p-2">
                    <input
                      type="number"
                      value={prod.precio}
                      onChange={(e) => handleProductoChange(prod.id, 'precio', e.target.value)}
                      className="border p-1 w-24 text-black rounded text-center focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </td>

                  <td className="border p-2">
                    {prod.imagen && (
                      <img src={prod.imagen} alt="panadería" className="w-12 h-12 object-cover rounded border" />
                    )}
                  </td>
                  
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => actualizarProductoCompleto(prod.id, prod.nombre_producto, prod.descripcion, prod.precio, prod.estado)}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded font-semibold transition-colors text-xs"
                    >
                      Guardar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white p-6 border rounded-lg shadow">
        <h2 className="text-2xl font-bold text-amber-900 mb-4">Administradores del Sistema</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border text-left text-sm">
            <thead>
              <tr className="bg-amber-100 text-amber-950">
                <th className="border p-2">Nombre Completo</th>
                <th className="border p-2">Correo Electrónico</th>
                <th className="border p-2">Teléfono Corporativo</th>
                <th className="border p-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {administradores.map((adminItem) => (
                <tr key={adminItem.id} className="hover:bg-amber-50/50">
                  <td className="border p-2">
                    <input
                      type="text"
                      value={adminItem.nombre}
                      onChange={(e) => handleAdminDataChange(adminItem.id, 'nombre', e.target.value)}
                      className="border p-1 w-full text-black rounded focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </td>
                  <td className="border p-2 text-gray-600">{adminItem.correo}</td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={adminItem.telefono ?? ""}
                      placeholder="Sin teléfono"
                      onChange={(e) => handleAdminDataChange(adminItem.id, 'telefono', e.target.value)}
                      className="border p-1 w-full text-black rounded focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => actualizarAdminLista(adminItem.id, adminItem.nombre, adminItem.telefono)}
                      className="bg-amber-800 hover:bg-amber-900 text-white px-3 py-1 rounded font-semibold transition-colors text-xs"
                    >
                      Actualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}