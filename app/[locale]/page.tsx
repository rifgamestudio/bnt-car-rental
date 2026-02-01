import SearchWidget from '@/components/SearchWidget';

export default function HomePage() {
  return (
    <main className="w-full flex flex-col bg-[#f3f4f6] min-h-screen">
      
      {/* SECCIÓN SUPERIOR: Gris Profesional */}
      <div className="relative w-full h-[580px] bg-gradient-to-b from-[#e5e7eb] to-[#f3f4f6] flex flex-col items-center pt-14 px-6 overflow-visible">
        
        {/* El Buscador - Capa Z superior */}
        <div className="relative z-50 w-full flex justify-center">
          <SearchWidget />
        </div>

        {/* El Coche BMW - Posicionado para pisar el naranja */}
        <div className="absolute bottom-[-50px] w-full max-w-[1000px] z-40 flex justify-center pointer-events-none">
          <img 
            src="https://www.sixt.es/fileadmin/files/global/user_upload/fleet/png/350x200/bmw-x5-5d-black-2023.png" 
            alt="BMW BNT" 
            className="w-[85%] h-auto object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.12)]"
          />
        </div>
      </div>

      {/* SECCIÓN INFERIOR: Naranja SIXT Style */}
      <div className="w-full bg-[#ff5f00] pt-36 pb-28 flex flex-col items-center text-center px-6 relative z-10">
        <h2 className="text-black text-[50px] md:text-[90px] font-[1000] leading-[0.8] tracking-tighter uppercase mb-8">
          ALQUILA PREMIUM. <br />
          PAGA ECONOMY.
        </h2>
        <p className="text-black text-lg md:text-2xl font-bold max-w-4xl opacity-90">
          Alquiler de coches premium a precios asequibles. En todo el mundo.
        </p>
      </div>

      {/* Relleno Negro Final */}
      <div className="w-full bg-black h-48"></div>
    </main>
  );
}