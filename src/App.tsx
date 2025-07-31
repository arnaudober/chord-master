import { useState } from "react";
import ChordCard from "./Card";
import chords from "./chords.json";

function App() {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * chords.length)
  );

  const nextChord = () => {
    // Create an array of all possible indices except the current one
    const availableIndices = Array.from({ length: chords.length }, (_, i) => i)
      .filter(i => i !== index);
    
    // Randomly select from the available indices
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const next = availableIndices[randomIndex];
    
    setIndex(next);
  };

  return (
    <div className="h-screen-dynamic flex flex-col items-center px-4 pt-dynamic-island overflow-hidden">
      <header className="w-full flex flex-col items-center flex-shrink-0 mb-5">
        <div className="px-4 py-2 w-full max-w-md rounded-2xl">
          <h1 className="heading-main text-center">
            chord master
          </h1>
        </div>
      </header>
      <ChordCard chord={chords[index]} onNext={nextChord} />
    </div>
  );
}

export default App;
