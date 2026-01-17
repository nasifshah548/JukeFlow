export type Song = {
  id: number;
  title: string;
  artist: string;
};

// Dummy Data

const fakeSongs: Song[] = [
  { id: 1, title: "Blinding Lights", artist: "The Weeknd" },
  { id: 2, title: "Levitating", artist: "Dua Lipa" },
  { id: 3, title: "Goosebumps", artist: "Travis Scott" },
  { id: 4, title: "Someone You Loved", artist: "Lewis Capaldi" },
  { id: 5, title: "Industry Baby", artist: "Lil Nas X" },
];

export default fakeSongs;
