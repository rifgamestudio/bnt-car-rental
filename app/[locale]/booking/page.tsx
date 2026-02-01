import BookingGuard from '@/components/booking/BookingGuard';

export default function BookingPage() {
  return (
    <main className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-black text-white mb-8 italic">RESERVA TU COCHE</h1>
      
      <BookingGuard>
        {/* Aquí va el buscador de coches real que solo se ve si estás verificado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl text-black">
            <img src="/placeholder-car.png" alt="Car" className="w-full h-40 object-contain" />
            <h4 className="font-bold text-xl mt-2">BMW Serie 4</h4>
            <p className="text-orange-600 font-black text-2xl mt-2">75€/día</p>
            <button className="w-full bg-black text-white py-3 rounded-lg mt-4 font-bold">RESERVAR AHORA</button>
          </div>
          {/* ... más coches */}
        </div>
      </BookingGuard>
    </main>
  );
}