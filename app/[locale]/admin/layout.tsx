import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#0a0a0a]">
        {/* Barra Lateral Fija */}
        <AdminSidebar />

        {/* Área de Contenido */}
        <main className="flex-1 flex flex-col">
          {/* Header del panel */}
          <header className="h-[60px] border-b border-zinc-800 bg-black flex items-center px-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Sistema en línea - BNT Cloud</span>
            </div>
          </header>

          {/* Contenido dinámico (Usuarios, Coches, etc.) */}
          <div className="p-10 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}