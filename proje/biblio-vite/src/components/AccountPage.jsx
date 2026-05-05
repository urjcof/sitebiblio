import React from 'react';

export default function AccountPage({ onAuthChange, onOpenWishlist}) {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
  const [user, setUser] = React.useState(null);
  const [mode, setMode] = React.useState('login'); // s'enregistrer ou se connecter
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState({ username: '', password: '' });
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch(`${API_BASE}/api/me`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function setField(k, v){ setForm(s => ({ ...s, [k]: v })); }

  async function submit(e){
    e.preventDefault();
    setError(null);
    const url = mode === 'login' ? `${API_BASE}/api/login` : `${API_BASE}/api/register`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return setError(data && data.error ? data.error : 'Erreur');
      setUser(data);
      // prévenir le composant parent que l'authentification a changé
      try { if (onAuthChange) onAuthChange(data); } catch (err) { /* pas d'action */ }
    } catch (err) {
      setError('Network error');
    }
  }

  async function logout(){
    try {
      await fetch(`${API_BASE}/api/logout`, { method: 'POST', credentials: 'include' });
    } catch {}
    setUser(null);
    try { if (onAuthChange) onAuthChange(null); } catch (err) { /* pas d'action */ }
  }

  if (loading) return <div className="p-6 text-gray-300">Chargement...</div>;

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-6 bg-gray-900 rounded shadow">
          <h2 className="text-white text-xl mb-4">{mode === 'login' ? 'Se connecter' : 'Créer un compte'}</h2>
          {error && <div className="mb-3 text-red-400">{error}</div>}
          <form onSubmit={submit} className="space-y-3 flex flex-col items-center">
            <div className="w-full flex flex-col items-center">
              <label className="block text-sm text-gray-300">Nom d'utilisateur</label>
              <input value={form.username} onChange={e => setField('username', e.target.value)} className="block w-full sm:w-56 mx-auto px-3 py-2 bg-gray-800 text-white rounded" />
            </div>
            <div className="w-full flex flex-col items-center">
              <label className="block text-sm text-gray-300">Mot de passe</label>
              <input type="password" value={form.password} onChange={e => setField('password', e.target.value)} className="block w-full sm:w-56 mx-auto px-3 py-2 bg-gray-800 text-white rounded" />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded w-full sm:w-40">{mode === 'login' ? 'Se connecter' : 'Créer'}</button>
              <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="px-4 py-2 bg-white/10 text-white rounded w-full sm:w-40">
                {mode === 'login' ? 'Créer un compte' : "J'ai déjà un compte"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-gray-900 rounded shadow text-gray-200">
        <h2 className="text-xl mb-2">Mon compte</h2>
        <div className="mb-4">Connecté en tant que <strong className="text-white">{user.username}</strong></div>
        <div className="flex flex-col gap-3 w-full items-center">
          <div className="w-full flex justify-center">
            <button onClick={() => onOpenWishlist && onOpenWishlist()} className="px-4 py-2 bg-white/10 rounded text-white w-full sm:w-auto">Voir ma wishlist</button>
          </div>
          <div className="w-full flex justify-center">
            <button onClick={logout} className="px-6 py-2 bg-red-600 rounded text-white w-full sm:w-40">Se déconnecter</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
  Sommaire du code :

 - ligne 
 - ligne 50 - 77 : chargement du compte et message d'erreur 








*/