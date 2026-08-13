"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase, Appareil, Historique } from "@/lib/supabase";

const statutColors: Record<string, string> = {
  "Déposé": "bg-blue-500/20 text-blue-400 border-blue-500/40",
  "En diagnostic": "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
  "En réparation": "bg-amber-500/20 text-amber-400 border-amber-500/40",
  "Pièces commandées": "bg-orange-500/20 text-orange-400 border-orange-500/40",
  "Réparé": "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
  "Prêt à récupérer": "bg-lime-500/20 text-lime-400 border-lime-500/40",
};

export default function SuiviPage() {
  const params = useParams();
  const numero = decodeURIComponent(params.numero as string).toUpperCase();

  const [appareil, setAppareil] = useState<Appareil | null>(null);
  const [historique, setHistorique] = useState<Historique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!numero) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      const { data: app, error: errApp } = await supabase
        .from("appareils")
        .select("*")
        .eq("numero_suivi", numero)
        .single();

      if (errApp || !app) {
        setError("Aucun appareil trouvé avec ce numéro de suivi.");
        setAppareil(null);
        setLoading(false);
        return;
      }

      setAppareil(app);

      const { data: hist } = await supabase
        .from("historique_statuts")
        .select("*")
        .eq("appareil_id", app.id)
        .order("created_at", { ascending: false });

      setHistorique(hist || []);
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel(`suivi-${numero}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appareils",
          filter: `numero_suivi=eq.${numero}`,
        },
        (payload) => {
          if (payload.new) {
            setAppareil(payload.new as Appareil);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [numero]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-lime-500/40">
            <Image src="/DDC92220-FBEF-4A89-A443-B2DE2321F1C1.png" alt="AT Réparations" fill className="object-cover" />
          </div>
          <div>
            <p className="font-semibold text-sm">
              <span className="text-lime-400">AT</span> RÉPARATIONS
            </p>
            <p className="text-xs text-neutral-500">Suivi de réparation</p>
          </div>
        </Link>
      </div>

      {loading && (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-neutral-400">Chargement...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
          <p className="text-red-400 font-medium">{error}</p>
          <Link href="/" className="inline-block mt-4 text-sm text-lime-400 hover:underline">
            ← Réessayer avec un autre numéro
          </Link>
        </div>
      )}

      {appareil && !loading && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-neutral-500 text-sm">Numéro de suivi</p>
            <p className="text-2xl font-bold tracking-widest text-white mt-1">
              {appareil.numero_suivi}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
            <p className="text-neutral-400 text-sm mb-3">État actuel</p>
            <span
              className={`inline-block px-5 py-2.5 rounded-full text-base font-semibold border ${
                statutColors[appareil.statut] || "bg-neutral-700 text-neutral-300"
              }`}
            >
              {appareil.statut}
            </span>
            {appareil.statut === "Prêt à récupérer" && (
              <p className="mt-4 text-lime-400 text-sm font-medium">
                Votre appareil est prêt ! Vous pouvez venir le récupérer.
              </p>
            )}
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Type</span>
              <span className="text-white font-medium">{appareil.type_appareil}</span>
            </div>
            {appareil.marque_modele && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Modèle</span>
                <span className="text-white font-medium">{appareil.marque_modele}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Déposé le</span>
              <span className="text-white font-medium">
                {formatDate(appareil.date_depot)}
              </span>
            </div>
            {appareil.commentaire && (
              <div className="pt-3 border-t border-neutral-800">
                <p className="text-neutral-500 text-sm mb-1">Note du magasin</p>
                <p className="text-neutral-200 text-sm leading-relaxed">
                  {appareil.commentaire}
                </p>
              </div>
            )}
          </div>

          {historique.length > 0 && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
              <h3 className="text-sm font-medium text-neutral-400 mb-4">Historique</h3>
              <div className="space-y-4">
                {historique.map((h, i) => (
                  <div key={h.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? "bg-lime-400" : "bg-neutral-600"}`} />
                      {i < historique.length - 1 && (
                        <div className="w-px flex-1 bg-neutral-700 my-1" />
                      )}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-medium text-white">{h.nouveau_statut}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{formatDate(h.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-neutral-600 text-xs pt-4">
            Mise à jour automatique en temps réel
          </p>
        </div>
      )}
    </main>
  );
}
