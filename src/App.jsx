import { useState, useEffect, useRef } from 'react';
import './App.css';


async function fetchSongs(query) {
  const response = await fetch(
    `https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&limit=20`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch songs');
  }

  const data = await response.json();

  return (data.data || []).map(track => ({
    trackId: track.id,
    trackName: track.title,
    artistName: track.user?.name || 'Unknown artist',
    artworkUrl100:
      track.artwork?.['150x150'] ||
      track.artwork?.['480x480'] ||
      '',
    previewUrl:
      `https://api.audius.co/v1/tracks/${track.id}/stream`
  }));
}

function App() {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('Home');
  const searchInputRef = useRef(null);

 async function searchSongs(searchTerm) {
  const term = searchTerm.trim();

  if (!term || loading) return;

  setLoading(true);
  setError('');

  try {
    const results = await fetchSongs(term);

    setSongs(results);
    setSelectedSong(results[0] || null);

    if (results.length === 0) {
      setError('No songs with playable previews found.');
    }
  } catch (err) {
    setError('Could not load songs. Check your internet connection.');
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    searchSongs('Daft Punk');
  }, []);

  return (
   <main className="app">
    <aside className="sidebar">
       <h1>🎧 Mini Spotify</h1>

       <button onClick={() => setActiveView('Home')}>
        Home
       </button>

       <button
        onClick={() => {
          setActiveView('Search');
          searchInputRef.current?.focus();
       }}
     >
       Search
     </button> 

      <button onClick={() => setActiveView('Your Library')}>
       Your Library
     </button>
   </aside>

      <section className="content">
        <h2>Discover Music</h2>

        <form
          onSubmit={event => {
            event.preventDefault();
            searchSongs(query);
          }}
        >
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search songs or artists..."
            value={query}
            onChange={event => setQuery(event.target.value)}
          />

          <button type="submit">Search</button>
        </form>

        {loading && <p>Loading songs...</p>}
        {error && <p>{error}</p>}

        <div className="song-list">
          {songs.map(song => (
            <button
              className="song"
              key={song.trackId}
              onClick={() => setSelectedSong(song)}
            >
              <img
                src={song.artworkUrl100}
                alt={`${song.trackName} album artwork`}
              />

              <span>
                <strong>{song.trackName}</strong>
                <br />
                {song.artistName}
              </span>
            </button>
          ))}
        </div>

        {selectedSong && (
          <div className="player">
            <div className="now-playing">
              <img
                src={selectedSong.artworkUrl100}
                alt=""
              />

              <div>
                <strong>{selectedSong.trackName}</strong>
                <p>{selectedSong.artistName}</p>
              </div>
            </div>
          
            <audio
              key={selectedSong.trackId}
              controls
              preload="metadata"
>
             <source
             src={selectedSong.previewUrl}
             type="audio/mp4"
           />
              Your browser does not support audio playback.
           </audio>
           
            
          </div>
        )}
      </section>
    </main>
  );
}

export default App;