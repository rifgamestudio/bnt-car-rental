"use client";

import React from 'react';

export default function CompleteProfilePage() {
  return (
    <div className="min-h-screen bg-black pt-32 text-center text-white">
      <h1 className="text-3xl font-[1000] italic uppercase tracking-tighter">
        Compléter le profil
      </h1>
      <p className="text-zinc-500 font-bold uppercase text-[10px] mt-4">
        Veuillez remplir vos informations pour continuer.
      </p>
    </div>
  );
}