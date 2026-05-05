import React from 'react';
import BookCard from './BookCard';

// WishlistPage: shows books that are marked as favorite (localStorage or provided favoritesSet)
export default function WishlistPage({ books = [], favoritesSet = null, onBack, onFavourite }) {
  // compute favorite ids: prefer favoritesSet (server) else read from localStorage
  const favIds = React.useMemo(() => {
    if (favoritesSet && favoritesSet.size) return new Set([...favoritesSet]);
    const ids = new Set();
    try {
      books.forEach(b => {
        const v = localStorage.getItem('fav:' + b.id);
        if (v && JSON.parse(v)) ids.add(b.id);
      });
    } catch {}
    return ids;
  }, [books, favoritesSet]);

  const favBooks = books.filter(b => favIds.has(b.id));

  if (!favBooks.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-300">
        <div className="text-xl mb-3">Ta wishlist est vide</div>
        <div className="text-sm">Clique sur le cœur sur une fiche pour l'ajouter à ta wishlist.</div>
        <div className="mt-6">
          <button onClick={onBack} className="btn-outline">← Retour</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <button onClick={onBack} className="btn-outline">← Retour</button>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Wishlist</h2>
        <div className="grid grid-cols-5 gap-4">
          {favBooks.map(b => (
            <div key={b.id} className="w-full">
              <BookCard book={b} onFavourite={onFavourite} fullWidth small />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
