import RegisterPage from "./register/page";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      {/* Aquí llamamos a la página de registro que adaptamos antes */}
      <RegisterPage />
    </main>
  );
}