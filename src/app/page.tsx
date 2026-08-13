"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const [numero, setNumero] = useState("");
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = numero.trim().toUpperCase();
    if (!clean) {
      setError("Veuillez entrer un numéro de suivi");
      return;
    }
    setLoading(true);
    setError("");
    router.push(`/suivi/${encodeURIComponent(clean)}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48 rounded-full overflow-hidden border-2 border-lime-500/40 shadow-lg shadow-lime-500/10">
            <Image
              src="/DDC92220-FBEF-4A89-A443-B2DE2321F1C1.png"
              alt="AT Réparations"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-lime-400">AT</span>{" "}
            <span className="text-white">RÉPARATIONS</span>
          </h1>
          <p className="text-neutral-400 mt-2 text-sm">
            Suivez l&apos;état de votre appareil en temps réel
          </p>
        </div>

        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="numero" className="block text-sm font-medium text-neutral-300 mb-2">
                Numéro de suivi
              </label>
              <input
                id="numero"
                type="text"
                value={numero}
                onChange={(e) => {
                  setNumero(e.target.value);
                  setError("");
                }}
                placeholder="Ex: AT-2026-0042"
                className="w-full px-4 py-3.5 bg-neutral-950 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500 transition-all text-center text-lg tracking-wider uppercase"
                autoComplete="off"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-400 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-lime-500 hover:bg-lime-400 disabled:bg-lime-500/50 text-black font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-lime-500/20"
            >
              {loading ? "Recherche..." : "Voir le suivi"}
            </button>
          </form>
        </div>

        <p className="text-center text-neutral-500 text-xs mt-8">
          AT Réparations · Brétignolles-sur-Mer<br />
          <a href="tel:0614024483" className="text-lime-500/80 hover:text-lime-400">
            06 14 02 44 83
          </a>
        </p>
      </div>
    </main>
  );
}
