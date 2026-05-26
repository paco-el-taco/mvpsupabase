"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Producto {
  id: string;
  nombre_producto: string;
  descripcion: string;
  estado: string;
  precio: number;
  imagen: string;
  categoria_id: string;
}

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
}

export default function MVPPage() {
  // Estados para Categorías
  const [nombreCat, setNombreCat] = useState<string>("");
  const [descCat, setDescCat] = useState<string>("");
  
  // Estados para Productos
  const [nombreProducto, setNombreProducto] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [precio, setPrecio] = useState<string>("");
  const [imagen, setImagen] = useState<string>("");
  const [estado, setEstado] = useState<string>("disponible");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("");

  // Listas generales
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  
  const [mensajeCat, setMensajeCat] = useState<string | null>(null);
  const [mensajeProd, setMensajeProd] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  // 🚀 Cargar categorías desde la BD
  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("id, nombre, descripcion")
      .order("nombre", { ascending: true });

    if (!error && data) setCategorias(data);
  };

  // 🚀 Cargar productos desde la BD
  const fetchProductos = async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("id, nombre_producto, descripcion, estado, precio, imagen, categoria_id")
      .order("creado_en", { ascending: false });

    if (!error && data) setProductos(data);
    setLoading(false);
  };

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

  // ⚙️ Crear una Nueva Categoría
  const handleCreateCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeCat(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMensajeCat("⚠️ Debes iniciar sesión.");
      return;
    }

    const { error } = await supabase.from("categorias").insert([
      {
        nombre: nombreCat,
        descripcion: descCat,
        admin_id: user.id
      }
    ]);

    if (error) {
      setMensajeCat("❌ Error: " + error.message);
    } else {
      setMensajeCat("✅ Categoría creada.");
      setNombreCat("");
      setDescCat("");
      fetchCategorias(); // Actualiza el selector dinámicamente
    }
  };

  // ⚙️ Crear un Nuevo Producto
  const handleCreateProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeProd(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMensajeProd("⚠️ Debes iniciar sesión.");
      return;
    }

    const { error } = await supabase.from("productos").insert([
      {
        nombre_producto: nombreProducto,
        descripcion,
        estado,
        precio: parseFloat(precio),
        imagen: imagen || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500",
        categoria_id: parseInt(categoriaSeleccionada),
        admin_id: user.id
      }
    ]);

    if (error) {
      setMensajeProd("❌ Error: " + error.message);
    } else {
      setMensajeProd("✅ Producto guardado con éxito.");
      setNombreProducto("");
      setDescripcion("");
      setPrecio("");
      setImagen("");
      setCategoriaSeleccionada("");
      setEstado("disponible");
      fetchProductos();
    }
  };

  useEffect(() => {
    fetchCategorias();
    fetchProductos();
  }, []);

  if (loading) return <p className="text-center mt-10 text-black">⏳ Cargando Consola de Administración...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 text-black">
      <h1 className="text-3xl font-bold text-center mb-8 text-amber-800">
        Consola de Gestión - Panadería Santa Isabel
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* FORMULARIO 1: CREAR CATEGORÍAS */}
        <div className="border p-5 rounded-lg shadow bg-white">
          <h2 className="text-xl font-bold text-amber-900 mb-4">1. Registrar Categoría</h2>
          <form onSubmit={handleCreateCategoria} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Nombre (ej: Confitería, Panes)"
              value={nombreCat}
              onChange={(e) => setNombreCat(e.target.value)}
              required
              className="border p-2 rounded text-black focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <textarea
              placeholder="Breve descripción"
              value={descCat}
              onChange={(e) => setDescCat(e.target.value)}
              className="border p-2 rounded text-black focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <button type="submit" className="bg-amber-800 text-white p-2 rounded font-bold hover:bg-amber-900 transition-colors">
              Añadir Categoría
            </button>
          </form>
          {mensajeCat && <p className="mt-2 text-sm text-center font-medium text-amber-950">{mensajeCat}</p>}
        </div>

        {/* FORMULARIO 2: CREAR PRODUCTOS */}
        <div className="border p-5 rounded-lg shadow bg-white">
          <h2 className="text-xl font-bold text-amber-900 mb-4">2. Registrar Producto</h2>
          <form onSubmit={handleCreateProducto} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Nombre del Producto"
              value={nombreProducto}
              onChange={(e) => setNombreProducto(e.target.value)}
              required
              className="border p-2 rounded text-black focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <input
              type="number"
              placeholder="Precio ($CO)"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
              className="border p-2 rounded text-black focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              required
              className="border p-2 rounded text-black focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">-- Selecciona Categoría --</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="border p-2 rounded text-black focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="disponible">Disponible</option>
              <option value="por_encargo">Por Encargo</option>
              <option value="agotado">Agotado</option>
            </select>
            <textarea
              placeholder="Descripción / Notas"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="border p-2 rounded text-black focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <input
              type="text"
              placeholder="URL de la imagen (Opcional)"
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
              className="border p-2 rounded text-black focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <button type="submit" className="bg-amber-600 text-white p-2 rounded font-bold hover:bg-amber-700 transition-colors">
              Guardar Producto
            </button>
          </form>
          {mensajeProd && <p className="mt-2 text-sm text-center font-medium text-amber-950">{mensajeProd}</p>}
        </div>

      </div>

      {/* VITRINA DE PRODUCTOS AGREGADOS */}
      <h2 className="text-2xl font-bold text-amber-800 text-center mt-12 mb-6 border-t pt-6">
        Inventario Real de la Panadería
      </h2>

      {productos.length === 0 ? (
        <p className="text-center text-gray-500">Aún no has digitado ningún artículo al inventario.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {productos.map((prod) => (
            <div key={prod.id} className="border rounded-lg shadow bg-white overflow-hidden flex flex-col justify-between">
              <img src={prod.imagen} alt={prod.nombre_producto} className="w-full h-40 object-cover" />
              <div className="p-4 flex-grow">
                <h3 className="font-bold text-lg text-gray-900">{prod.nombre_producto}</h3>
                <p className="text-gray-600 text-sm h-12 overflow-hidden mt-1">{prod.descripcion}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-amber-700">${Number(prod.precio).toLocaleString()}</span>
                  <span className={`text-xs px-2 py-1 rounded font-semibold uppercase ${
                    prod.estado === 'disponible' ? 'bg-green-100 text-green-800' :
                    prod.estado === 'por_encargo' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                  }`}>{prod.estado.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}