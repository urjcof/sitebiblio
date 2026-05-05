import React from "react";

/**
 * BookCard : affichage d'une couverture façon Letterboxd
 * Props:
 *  - book: { id, title, cover, year, rating }
 *  - onRead(book), onBorrow(copyId, book)
 */
export default function BookCard({ book, onRead, onBorrow, small, onFavourite, initialFav, fullWidth = false }) {
  const rating = typeof book?.rating === 'number' ? book.rating : (book?.rating ? Number(book.rating) : null);
  // préférer une miniature d'affichage pour la vue paginée, sinon utiliser la couverture
  const src = book.thumb || book.cover;
  const [fav, setFav] = React.useState(() => {
    if (typeof initialFav !== 'undefined') return !!initialFav;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const v = localStorage.getItem('fav:' + book.id);
        return v ? JSON.parse(v) : false;
      }
    } catch (e) {
      return false;
    }
    return false;
  });

  // si le parent met à jour le favori (ex : après connexion -> favoris serveur), refléter cela
  React.useEffect(() => {
    if (typeof initialFav !== 'undefined') {
      setFav(!!initialFav);
    }
  }, [initialFav, book.id]);

  function toggleFav(e){
    e.stopPropagation();
    const next = !fav;
    setFav(next);
    try { localStorage.setItem('fav:' + book.id, JSON.stringify(next)); } catch {}
    if (onFavourite) onFavourite(book, next);
  }

  const outerWidthClass = fullWidth ? 'w-full' : (small ? 'w-28' : 'w-44 sm:w-48 md:w-52 lg:w-56');

  return (
    <div className={outerWidthClass + " flex-shrink-0"}>
      <div className={`group relative bg-gray-900 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 ${small ? '' : 'hover:-translate-y-1'}`}>
        {/* conteneur d'image de taille fixe pour uniformiser l'affichage des couvertures */}
        <div
          className="w-full bg-gray-800 flex items-center justify-center overflow-hidden"
          style={{ height: small ? 120 : (fullWidth ? 160 : 280) }}
        >
          <img
            src={src}
            alt={book.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            className="group-hover:scale-105 transition-transform duration-300 block"
          />
        </div>

        <div className="px-3 py-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex items-center justify-between">
            <div className="text-white text-sm font-semibold truncate">{book.title}</div>
            {rating !== null && !Number.isNaN(rating) && (
              <div className="text-yellow-400 text-xs font-medium ml-2">{Number(rating).toFixed(1)}</div>
            )}
          </div>
          <div className="text-gray-300 text-xs mt-1">
            {book.category && (
              <span className="inline-block bg-white/6 text-xs text-gray-200 px-2 py-0.5 rounded mr-2">{book.category}</span>
            )}
            <div className="mt-1 flex items-center justify-between">
            <span>{book.year ?? "—"}</span>
            <div className="flex gap-2 items-center">
              {!small && (
                <>
                  <button
                    onClick={() => onRead && onRead(book)}
                    className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded"
                  >
                    Lire
                  </button>
                  <button
                    onClick={() => onBorrow && onBorrow(book.copies?.[0]?.id, book)}
                    className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                  >
                    Emprunter
                  </button>
                </>
              )}

              {/* bouton coeur */}
              <button onClick={toggleFav} aria-pressed={fav} className="p-1 rounded heart-btn">
                {fav ? (
                  <svg className="heart-icon filled" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.54 0 3.04.99 3.57 2.36h.87C14.46 4.99 15.96 4 17.5 4 20 4 22 6 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg className="heart-icon outline" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>);
}
