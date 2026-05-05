import React, { useState, useEffect } from "react";
import BookCard from "./BookCard";
import AccountPage from "./AccountPage";
const LazyWishlist = React.lazy(() => import('./WishlistPage'));


export default function MainPage() {
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
  const [books, setBooks] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [query, setQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [visibleStarts, setVisibleStarts] = useState([0,0,0,0,0,0,0]);
  const [favorites, setFavorites] = useState(new Set());

  // effet de fetch unique : charger les livres et les favoris une fois
  useEffect(() => {
    let mounted = true;
    (async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/books`);
        if (!mounted) return;
          if (res.ok) {
          const data = await res.json();
          // accepte soit un tableau soit un objet
          const arr = Array.isArray(data) ? data : (Array.isArray(data.books) ? data.books : []);
          setBooks(arr.length ? arr : SAMPLE);

          // tenter de charger les catégories depuis le serveur 
          let catsFromServer = null;
          try {
            const catRes = await fetch(`${API_BASE}/api/categories`);
            if (catRes.ok) {
              const cats = await catRes.json();
              if (Array.isArray(cats) && cats.length) catsFromServer = cats;
            }
          } catch (e) {}

          const shuffled = [...data].sort(() => Math.random() - 0.5);
          setTrending(shuffled.slice(0, 10));
          if (catsFromServer) {
            // conserver les catégories fournies par le serveur (objets avec id,name,slug)
            setCategories(catsFromServer);
          } else {
            const uniqCats = Array.from(new Set(data.map(b => b.category).filter(Boolean)));
            if (uniqCats.length <= 6) setCategories(uniqCats.map(n => ({ id: null, name: n })));
            else setCategories(uniqCats.sort(() => Math.random() - 0.5).slice(0,6).map(n => ({ id: null, name: n })));
          }
          const map = {};
          const normalizeKeyLocal = (s) => {
            if (!s) return '';
            let t = s.toString().trim().toLowerCase();
            t = t.normalize && t.normalize('NFD').replace(/[\u0300-\u036f]/g, '') || t;
            t = t.replace(/[^a-z0-9]+/g, ' ');
            t = t.replace(/\s+/g, ' ').trim();
            return t;
          };
          for (const b of data) {
            const key = normalizeKeyLocal(b.category);
            if (!map[key]) map[key] = [];
            map[key].push(b);
          }
          setCategoryMap(map);
        } else {
          setBooks(SAMPLE);
          const shuffled = [...SAMPLE].sort(() => Math.random() - 0.5);
          setTrending(shuffled.slice(0, 10));
          const uniqCats = Array.from(new Set(SAMPLE.map(b => b.category).filter(Boolean)));
          if (uniqCats.length <= 5) setCategories(uniqCats);
          else setCategories(uniqCats.sort(() => Math.random() - 0.5).slice(0,5));
          const map = {};
          const normalizeKeyLocal = (s) => {
            if (!s) return '';
            let t = s.toString().trim().toLowerCase();
            t = t.normalize && t.normalize('NFD').replace(/[\u0300-\u036f]/g, '') || t;
            t = t.replace(/[^a-z0-9]+/g, ' ');
            t = t.replace(/\s+/g, ' ').trim();
            return t;
          };
          for (const b of SAMPLE) {
            const key = normalizeKeyLocal(b.category);
            if (!map[key]) map[key] = [];
            map[key].push(b);
          }
          setCategoryMap(map);
        }
      } catch (err) {
        console.warn('Failed to fetch books, using sample', err);
        setBooks(SAMPLE);
        const shuffled = [...SAMPLE].sort(() => Math.random() - 0.5);
        setTrending(shuffled.slice(0, 10));
        const uniqCats = Array.from(new Set(SAMPLE.map(b => b.category).filter(Boolean)));
        if (uniqCats.length <= 5) setCategories(uniqCats);
        else setCategories(uniqCats.sort(() => Math.random() - 0.5).slice(0,5));
      }

      try {
        const favRes = await fetch(`${API_BASE}/api/favorites`, { credentials: 'include' });
        if (!mounted) return;
        if (favRes.ok) {
          const favs = await favRes.json();
          setFavorites(new Set(favs));
        }
      } catch (err) {
      }
    })();
    return () => { mounted = false };
  }, []);

  // la navigation au clavier n'est pas encore implémentée pour plusieurs carrousels

  function handleAuthChange(user) {
    setUser(user);
    if (user) {
      fetch(`${API_BASE}/api/favorites`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : [])
        .then(favs => setFavorites(new Set(favs)))
        .catch(() => {});
    } else {
      setFavorites(new Set());
      setWishlistOpen(false);
    }
  }

  const PAGE_SIZE = 5;
  const totalPages = Math.max(1, Math.ceil(books.length / PAGE_SIZE));

  const CAROUSEL_COUNT = 7; // 0: tendance, 1-6: catégories (inclut désormais Philosophie)

  function scrollCarousel(index, delta, itemsLength) {
    setVisibleStarts(prev => {
      const copy = [...prev];
      const maxStart = Math.max(0, itemsLength - PAGE_SIZE);
      copy[index] = Math.min(maxStart, Math.max(0, (copy[index] || 0) + delta));
      return copy;
    });
  }

  // normaliseur partagé pour les comparaisons de catégories
  const normalizeKey = (s) => {
    if (!s) return '';
    let t = s.toString().trim().toLowerCase();
    t = t.normalize && t.normalize('NFD').replace(/[\u0300-\u036f]/g, '') || t;
    t = t.replace(/[^a-z0-9]+/g, ' ');
    t = t.replace(/\s+/g, ' ').trim();
    return t;
  };

  // livres filtrés dérivés de la recherche (correspondance titre OU catégorie)
  const q = (query || '').toString().trim().toLowerCase();
  const filteredBooks = q
    ? books.filter(b => {
        const title = (b.title || '').toString().toLowerCase();
        const cat = (b.category || '').toString().toLowerCase();
        return title.includes(q) || cat.includes(q);
      })
    : books;

  function onRead(book) {
    
    alert(`Ouvrir lecteur: ${book.title}`);
  }

  function onBorrow(copyId, book) {
    
    alert(`Emprunter: ${book.title} (copy ${copyId || "n/a"})`);
    
    setBooks(prev => prev.map(b => b.id === book.id ? { ...b, copies: b.copies.map(c => ({...c, status: c.id === copyId ? "LOANED" : c.status})) } : b));
  }
  // rendu principal
  return (
    <div className="min-h-screen bg-[#111217] text-gray-100 p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div className="text-3xl font-extrabold tracking-wide text-white px-4 py-2 border border-neutral-700 rounded bg-gradient-to-b from-neutral-900 to-neutral-800 shadow">
            BOOKBOXD
          </div>
          <nav className="hidden md:flex gap-3 ml-6 text-sm">
            <button className="btn-outline" onClick={() => { setAccountOpen(false); setWishlistOpen(false); setVisibleStarts(new Array(7).fill(0)); }}>Découvrir</button>
            <button className="btn-outline" onClick={() => { setWishlistOpen(true); setAccountOpen(false); }}>Wishlist</button>
            <button className="btn-outline" onClick={() => setAccountOpen(true)}>Compte</button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un livre"
            className="search-input"
          />
        </div>
      </header>

      {accountOpen ? (
        <section>
          <div className="mb-4">
            <button onClick={() => setAccountOpen(false)} className="btn-outline">← Retour</button>
          </div>
          <AccountPage 
            onAuthChange={(u) => { setUser(u); handleAuthChange(u); }}
            onAuthChange={handleAuthChange} onOpenWishlist={() => { setWishlistOpen(true); setAccountOpen(false); }} 
          />
        </section>
      ) : wishlistOpen ? (
        <section>
          <React.Suspense fallback={<div>Chargement...</div>}>
            <LazyWishlist books={books} favoritesSet={favorites} onBack={() => setWishlistOpen(false)} onFavourite={async (book, value) => {
              try {
                const res = await fetch(`${API_BASE}/api/favorites`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ book_id: book.id, action: value ? 'add' : 'remove' })
                });
                if (res.ok) {
                  const favs = await res.json();
                  setFavorites(new Set(favs));
                } else if (res.status === 401) {
                  try { localStorage.setItem('fav:' + book.id, JSON.stringify(value)); } catch {}
                  setFavorites(prev => {
                    const copy = new Set(prev);
                    if (value) copy.add(book.id); else copy.delete(book.id);
                    return copy;
                  });
                }
              } catch (err) {
                console.error('fav update error', err);
                try { localStorage.setItem('fav:' + book.id, JSON.stringify(value)); } catch {}
              }
            }} />
          </React.Suspense>
        </section>
      ) : (
        <section>
          {/* Render 6 carousels: 0 = Trending, 1-5 = category carousels */}

          {query ? (
            <div>
              <div className="mb-4">
                <button onClick={() => setQuery('')} className="btn-outline">← Retour</button>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Résultats pour "{query}"</h2>
                {filteredBooks.length ? (
                  <div className="grid grid-cols-5 gap-4">
                    {filteredBooks.slice(0, 20).map(b => (
                      <div key={b.id} className="w-full">
                        <BookCard
                          book={b}
                          onRead={onRead}
                          onBorrow={onBorrow}
                          initialFav={favorites.has(b.id)}
                          fullWidth
                          small
                          onFavourite={async (book, value) => {
                            try {
                              const res = await fetch(`${API_BASE}/api/favorites`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ book_id: book.id, action: value ? 'add' : 'remove' })
                              });
                              if (res.ok) {
                                const favs = await res.json();
                                setFavorites(new Set(favs));
                              } else if (res.status === 401) {
                                try { localStorage.setItem('fav:' + book.id, JSON.stringify(value)); } catch {}
                                setFavorites(prev => {
                                  const copy = new Set(prev);
                                  if (value) copy.add(book.id); else copy.delete(book.id);
                                  return copy;
                                });
                              }
                            } catch (err) {
                              console.error('fav update error', err);
                              try { localStorage.setItem('fav:' + book.id, JSON.stringify(value)); } catch {}
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-neutral-400">Aucun résultat pour "{query}"</div>
                )}
              </div>
            </div>
          ) : (() => {
            // Construire exactement 6 carrousels de catégories (avec 'Tendance' séparé)
            const desiredCats = ['Conte','Science-fiction','Dystopie','Philosophie','Aventure','Roman'];
            const serverCats = (categories && categories.length) ? categories : [];
            const carouselCats = desiredCats.map(name => {
              const found = serverCats.find(c => normalizeKey(c.name || c) === normalizeKey(name));
              return found ? found : { id: null, name };
            });

            const carousels = [];

            // tendance (premier carrousel)
            const trendingItems = (trending && trending.length) ? trending.slice(0, 10) : books.slice(0, 10);
            carousels.push({ title: 'Tendance du moment', items: trendingItems });

            // Pour chacune des 6 catégories, préférer category_id si présent, sinon comparer le nom normalisé
            for (let i = 0; i < carouselCats.length; i++) {
              const cat = carouselCats[i];
              const catId = cat && (typeof cat.id !== 'undefined') ? cat.id : null;
              const catNameNorm = normalizeKey(cat && (cat.name || cat));
              const items = books.filter(b => {
                if (catId !== null && typeof b.category_id !== 'undefined' && b.category_id !== null) {
                  // comparaison numérique des ids (gère string/number)
                  return Number(b.category_id) === Number(catId);
                }
                return normalizeKey(b.category) === catNameNorm;
              }).slice(0, 10);
              carousels.push({ title: cat.name || cat, items });
            }

            return carousels.map((carr, idx) => (
              <div key={carr.title} className="relative mb-8">
                <h2 className="text-2xl font-semibold mb-4">{carr.title}</h2>

                <button
                  type="button"
                  onClick={() => scrollCarousel(idx, -1, carr.items.length)}
                  aria-label="Précédent"
                  className="carousel-arrow"
                  style={{ left: 12, top: '50%', position: 'absolute', zIndex: 60, transform: 'translateY(-50%)' }}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex items-center gap-6 px-6 py-2 justify-center">
                  <div className="flex-shrink-0 w-4" />

                  {carr.items.slice(visibleStarts[idx] || 0, (visibleStarts[idx] || 0) + PAGE_SIZE).map((b) => (
                    <div key={b.id} className="flex-shrink-0">
                      <BookCard
                        book={b}
                        onRead={onRead}
                        onBorrow={onBorrow}
                        initialFav={favorites.has(b.id)}
                        onFavourite={async (book, value) => {
                          try {
                            const res = await fetch(`${API_BASE}/api/favorites`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({ book_id: book.id, action: value ? 'add' : 'remove' })
                            });
                            if (res.ok) {
                              const favs = await res.json();
                              setFavorites(new Set(favs));
                            } else if (res.status === 401) {
                              try { localStorage.setItem('fav:' + book.id, JSON.stringify(value)); } catch {}
                              setFavorites(prev => {
                                const copy = new Set(prev);
                                if (value) copy.add(book.id); else copy.delete(book.id);
                                return copy;
                              });
                            }
                          } catch (err) {
                            console.error('fav update error', err);
                            try { localStorage.setItem('fav:' + book.id, JSON.stringify(value)); } catch {}
                          }
                        }}
                      />
                    </div>
                  ))}

                  <div className="flex-shrink-0 w-4" />
                </div>

                <button
                  type="button"
                  onClick={() => scrollCarousel(idx, 1, carr.items.length)}
                  aria-label="Suivant"
                  className="carousel-arrow"
                  style={{ right: 12, top: '50%', position: 'absolute', zIndex: 60, transform: 'translateY(-50%)' }}
                  >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ));
          })()}
        </section>
      )}
    </div>
  );
}