"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";
import { Mail, X } from "lucide-react";
import { useRouter } from "@/navigation";

export default function LoginPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  // CORRECCIÓN: Función para que el botón de email funcione
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-black/90 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-black relative">
        <button onClick={() => router.push("/")} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-[1000] tracking-tighter mb-2 uppercase italic text-center">
          {t("welcome")}
        </h2>
        <p className="text-gray-500 text-[11px] font-bold mb-8 uppercase text-center leading-tight">
          {t("desc")}
        </p>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">{t("email_label")}</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-lg outline-none focus:border-black font-bold text-sm bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase text-gray-400">{t("pass_label")}</label>
              <button type="button" className="text-[9px] font-bold text-gray-400 underline uppercase italic">
                {t("forgot_pass")}
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 border border-gray-200 rounded-lg outline-none focus:border-black font-bold text-sm bg-gray-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#ff5f00] text-white rounded-xl font-[1000] uppercase italic tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95"
          >
            {loading ? "..." : t("btn_continue")}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-[1px] bg-gray-100"></div>
          <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">{t("or_social")}</span>
          <div className="flex-1 h-[1px] bg-gray-100"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 h-14 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          <span className="text-sm font-black uppercase tracking-tight italic">Google</span>
        </button>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-3 tracking-tighter">{t("no_account")}</p>
          {/* CORRECCIÓN: Teeexto centrado perfectamente */}
          <button
            onClick={() => router.push("/auth/register")}
            className="w-full h-12 bg-gray-100 text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition flex items-center justify-center"
          >
            {t("create_account")}
          </button>
        </div>
      </div>
    </div>
  );
}