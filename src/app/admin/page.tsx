"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase, Appareil, STATUTS } from "@/lib/supabase";

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appareils, setAppareils] = useState<Appareil[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [newNumero, setNewNumero] = useState("");
  const [newType, setNewType] = useState("Téléphone");
  const [newModele, setNewModele] = useState("");
  const [newCommentaire, setNewCommentaire] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatut, setEditStatut] = useState("");
  const [editCommentaire, setEditCommentaire] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) loadAppareils();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadAppareils();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadAppareils = async () => {
    const { data } = await supabase
      .from("appareils")
      .select("*")
      .order("updated_at", { ascending: false });
    setAppareils(data || []);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Email ou mot de passe incorrect");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const createAppareil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumero.trim()) return;

    const numero = newNumero.trim().toUpperCase();

    const { data, error } = await supabase
      .from("appareils")
      .insert({
        numero_suivi: numero,
        type_appareil: newType,
        marque_modele: newModele || null,
        statut: "Déposé",
        date_depot: new Date().toISOString(),
        commentaire: newCommentaire || null,
      })
      .select()
      .single();

    if (!error && data) {
      await supabase.from("historique_statuts").insert({
        appareil_id: data.id,
        ancien_statut: null,
        nouveau_statut: "Déposé",
        commentaire: newCommentaire || null,
      });

      setNewNumero("");
      setNewModele("");
      setNewCommentaire("");
      setShowForm(false);
      loadAppareils();
    } else {
      alert("Erreur : ce numéro existe peut-être déjà");
    }
  };
    const updateStatut = async (appareil: Appareil) => {
    if (!editStatut) return;

    const { error } = await supabase
      .from("appareils")
      .update({
        statut: editStatut,
        commentaire: editCommentaire || appareil.commentaire,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appareil.id);

    if (!error) {
      await supabase.from("historique_statuts").insert({
        appareil_id: appareil.id,
        ancien_statut: appareil.statut,
        nouveau_statut: editStatut,
        commentaire: editCommentaire || null,
      });
      setEditingId(null);
      loadAppareils();
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-lime-500/40">
              <Image src="/logo-at.png" alt="AT Réparations" fill className="object-cover" />
            </div>
          </div>
          <h1 className="text-center text-xl font-bold mb-6">
            Espace <span className="text-lime-400">Magasin</span>
          </h1>
          <form onSubmit={handleLogin} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500/50" required />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500/50" required />
            </div>
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
            <button type="submit" className="w-full py-3 bg-lime-500 hover:bg-lime-400 text-black font-semibold rounded-xl transition">Se connecter</button>
          </form>
          <p className="text-center text-neutral-600 text-xs mt-6">
            <Link href="/" className="hover:text-neutral-400">← Retour au suivi client</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-lime-500/40">
            <Image src="/logo-at.png" alt="Logo" fill className="object-cover" />
          </div>
          <div>
            <p className="font-semibold text-sm">AT Réparations</p>
            <p className="text-xs text-neutral-500">Espace magasin</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-sm text-neutral-400 hover:text-white transition">Déconnexion</button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Appareils en cours</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-lime-500 hover:bg-lime-400 text-black text-sm font-semibold rounded-xl transition">
          {showForm ? "Annuler" : "+ Nouveau"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createAppareil} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400">N° de suivi *</label>
              <input value={newNumero} onChange={(e) => setNewNumero(e.target.value)} placeholder="AT-2026-0042" className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm uppercase" required />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Type</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm">
                <option>Téléphone</option>
                <option>Ordinateur</option>
                <option>Tablette</option>
                <option>Console</option>
                <option>Autre</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-neutral-400">Marque / Modèle</label>
            <input value={newModele} onChange={(e) => setNewModele(e.target.value)} placeholder="iPhone 13, PS5..." className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs text-neutral-400">Commentaire</label>
            <input value={newCommentaire} onChange={(e) => setNewCommentaire(e.target.value)} placeholder="Écran cassé..." className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-lime-500 hover:bg-lime-400 text-black font-semibold rounded-xl text-sm">Créer le dossier</button>
        </form>
      )}

      <div className="space-y-3">
        {appareils.length === 0 && (
          <p className="text-center text-neutral-500 py-10">Aucun appareil pour le moment</p>
        )}
        {appareils.map((app) => (
          <div key={app.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono font-semibold text-lime-400">{app.numero_suivi}</p>
                <p className="text-sm text-neutral-300 mt-0.5">
                  {app.type_appareil}{app.marque_modele ? ` · ${app.marque_modele}` : ""}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Déposé le {formatDate(app.date_depot)}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 whitespace-nowrap">{app.statut}</span>
            </div>
            {app.commentaire && <p className="text-xs text-neutral-400 mt-2 italic">{app.commentaire}</p>}
            {editingId === app.id ? (
              <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2">
                <select value={editStatut} onChange={(e) => setEditStatut(e.target.value)} className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm">
                  {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input value={editCommentaire} onChange={(e) => setEditCommentaire(e.target.value)} placeholder="Note (optionnel)" className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm" />
                <div className="flex gap-2">
                  <button onClick={() => updateStatut(app)} className="flex-1 py-2 bg-lime-500 text-black text-sm font-semibold rounded-lg">Enregistrer</button>
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 bg-neutral-800 text-sm rounded-lg">Annuler</button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setEditingId(app.id); setEditStatut(app.statut); setEditCommentaire(app.commentaire || ""); }} className="mt-3 text-xs text-lime-500 hover:text-lime-400 font-medium">
                Modifier le statut →
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
