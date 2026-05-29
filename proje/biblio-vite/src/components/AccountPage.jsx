import React from 'react';

export default function AccountPage({ onAuthChange, onOpenWishlist }) {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
  const [user, setUser] = React.useState(null);
  const [mode, setMode] = React.useState('login');
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

  function setField(k, v) { setForm(s => ({ ...s, [k]: v })); }

  function getInitials(name) {
    return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);
    const url = mode === 'login' ? `${API_BASE}/api/login` : `${API_BASE}/api/register`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data?.error || 'Erreur');
      setUser(data);
      try { if (onAuthChange) onAuthChange(data); } catch {}
    } catch {
      setError('Erreur réseau');
    }
  }

  async function logout() {
    try { await fetch(`${API_BASE}/api/logout`, { method: 'POST', credentials: 'include' }); } catch {}
    setUser(null);
    try { if (onAuthChange) onAuthChange(null); } catch {}
  }

  if (loading) {
    return (
      <div className="account-page">
        <div className="account-loading">Chargement…</div>
      </div>
    );
  }

  /* ── Logged in ─────────────────────────────────────── */
  if (user) {
    return (
      <div className="account-page">
        <div className="account-profile-card">

          {/* Avatar + nom */}
          <div className="account-avatar-row">
            <div className="account-avatar">
              {getInitials(user.username)}
            </div>
            <div className="account-avatar-info">
              <div className="account-username">{user.username}</div>
              <div className="account-badge">
                <span className="account-badge-dot" />
                Membre actif
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="account-action-list">
            <button className="account-action-item" onClick={() => onOpenWishlist && onOpenWishlist()}>
              <div className="account-action-icon">♥</div>
              <span className="account-action-label">Ma wishlist</span>
              <span className="account-action-arrow">›</span>
            </button>
            <div className="account-action-divider" />

            <button className="account-action-item account-action-danger" onClick={logout}>
              <div className="account-action-icon">⎋</div>
              <span className="account-action-label">Se déconnecter</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  /* ── Auth form ─────────────────────────────────────── */
  return (
    <div className="account-page">

      {/* En-tête */}
      <div className="account-brand">
        <span className="account-brand-dot">●</span> BOOKBOXD
      </div>
      <p className="account-brand-sub">Connectez-vous pour accéder à votre bibliothèque</p>

      {/* Toggle */}
      <div className="account-tab-toggle">
        <button
          className={`account-tab-btn${mode === 'login' ? ' active' : ''}`}
          onClick={() => { setMode('login'); setError(null); }}
        >
          Se connecter
        </button>
        <button
          className={`account-tab-btn${mode === 'register' ? ' active' : ''}`}
          onClick={() => { setMode('register'); setError(null); }}
        >
          Créer un compte
        </button>
      </div>

      {/* Card formulaire */}
      <div className="account-form-card">
        <div className="account-form-header">
          <div className="account-form-title">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </div>
          <div className="account-form-sub">
            {mode === 'login' ? 'Bienvenue — content de vous revoir' : 'Rejoignez la communauté'}
          </div>
        </div>

        <form className="account-form-body" onSubmit={submit}>
          {error && <div className="account-error">{error}</div>}

          <div className="account-field">
            <label className="account-label">Nom d'utilisateur</label>
            <input
              className="account-input"
              value={form.username}
              onChange={e => setField('username', e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="account-field">
            <label className="account-label">Mot de passe</label>
            <input
              className="account-input"
              type="password"
              value={form.password}
              onChange={e => setField('password', e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          <button type="submit" className="account-btn-primary">
            {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>

          <div className="account-switch-row">
            {mode === 'login' ? (
              <>Pas encore de compte ?{' '}
                <button type="button" className="account-switch-btn" onClick={() => { setMode('register'); setError(null); }}>
                  Créer un compte
                </button>
              </>
            ) : (
              <>Déjà un compte ?{' '}
                <button type="button" className="account-switch-btn" onClick={() => { setMode('login'); setError(null); }}>
                  Se connecter
                </button>
              </>
            )}
          </div>
        </form>
      </div>

    </div>
  );
}

/*
  Sommaire du code :

  - Lignes 1–57   : état, fetch /api/me, helpers (initials, submit, logout)
  - Lignes 59–64  : écran de chargement
  - Lignes 67–116 : vue profil connecté (avatar, stats, actions, déconnexion)
  - Lignes 119–195: formulaire auth (toggle login/register, champs, erreur)
*/