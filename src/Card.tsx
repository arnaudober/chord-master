import { useState } from "react";
import type { Props } from "./model";
import { Piano, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import * as Tone from "tone";

export default function ChordCard({ chord, onNext }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Play chord sound when flipped
  async function playChord() {
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    await Tone.start();
    
    // Play notes one after the other (arpeggio)
    chord.keys.forEach((note, index) => {
      const delay = index * 0.3; // 100ms delay between each note
      synth.triggerAttackRelease(note, "0.5", `+${delay}`);
    });
  }

  const handleClick = () => {
    setAnimating(true);
    setTimeout(() => {
      setAnimating(false);
      if (!flipped) {
        setFlipped(true);
        playChord();
      } else {
        setFlipped(false);
        onNext();
      }
    }, 180);
  };

  const sharpNotes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  const chordMidiNumbers = chord.keys.map((key) => MidiNumbers.fromNote(key));
  const minMidi = Math.min(...chordMidiNumbers);
  const maxMidi = Math.max(...chordMidiNumbers);

  // Calculate a focused range around the chord notes
  // Add 2 semitones padding on each side for better visual context
  const padding = 2;
  let first = minMidi - padding;
  let last = maxMidi + padding;

  // Ensure we show at least 8 semitones (about 2/3 of an octave) for visual balance
  const minRange = 8;
  if (last - first < minRange) {
    const extra = minRange - (last - first);
    const extraBefore = Math.floor(extra / 2);
    const extraAfter = extra - extraBefore;
    first = Math.max(21, first - extraBefore); // Don't go below A0
    last = Math.min(108, last + extraAfter);   // Don't go above C8
  }

  // Ensure we don't go outside the piano's MIDI range (21-108)
  first = Math.max(21, first);
  last = Math.min(108, last);

  // Extend the range to end on a white key to prevent black key overflow
  // White keys are at positions 0, 2, 4, 5, 7, 9, 11 in the octave (C, D, E, F, G, A, B)
  const whiteKeyPositions = [0, 2, 4, 5, 7, 9, 11];
  const lastNoteInOctave = last % 12;
  
  // If the last note is a black key, extend to the next white key
  if (!whiteKeyPositions.includes(lastNoteInOctave)) {
    const nextWhiteKey = whiteKeyPositions.find(pos => pos > lastNoteInOctave);
    if (nextWhiteKey !== undefined) {
      last = last - lastNoteInOctave + nextWhiteKey;
    } else {
      // If we're at the end of the octave, go to the next octave's C
      last = last - lastNoteInOctave + 12;
    }
  }

  function midiNumberToSharpName(midiNumber: number) {
    const noteIndex = midiNumber % 12;
    const octave = Math.floor(midiNumber / 12) - 1;
    return `${sharpNotes[noteIndex]}${octave}`;
  }

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div
        onClick={handleClick}
        className={`glass w-full max-w-[420px] min-w-[220px] min-h-[100px] sm:min-h-[120px] text-center cursor-pointer transition-all duration-300 rounded-2xl flex flex-col items-center justify-center ${
          animating ? "scale-95 opacity-80" : "scale-100 opacity-100"
        }`}
        role="button"
        aria-pressed={flipped}
        aria-label={flipped ? "Show next chord" : "Reveal chord voicing"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        style={{
          willChange: "transform, opacity",
        }}
      >
        {!flipped ? (
          <h1
            className="chord-name smooth text-4xl sm:text-5xl md:text-6xl font-extrabold"
            style={{ letterSpacing: "0.03em" }}
          >
            {chord.name}
          </h1>
        ) : (
          <>
            <div
              className="rounded-2xl w-full flex justify-center smooth h-[180px]"
              style={{ pointerEvents: "none" }}
            >
              <Piano
                noteRange={{ first, last }}
                playNote={() => {}}
                stopNote={() => {}}
                renderNoteLabel={({ midiNumber }) => {
                  const noteName = midiNumberToSharpName(midiNumber);
                  const isActive = chord.keys.includes(noteName);
                  if (!isActive) return null;
                  const noteLabel = sharpNotes[midiNumber % 12];
                  return (
                    <div
                      className={
                        `piano-key text-[0.8rem] font-black smooth py-1 text-black/60 ` +
                        (isActive ? "piano-key-active" : "")
                      }
                      aria-label={noteLabel + " key"}
                    >
                      {noteLabel}
                    </div>
                  );
                }}
                activeNotes={chord.keys.map((key) => MidiNumbers.fromNote(key))}
              />
            </div>
            <button
              className={`my-2 px-6 py-4 w-full max-w-xs font-bold text-xl text-zinc-900 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 smooth overflow-hidden relative active:scale-95`}
              onClick={() => {
                setFlipped(false);
                onNext();
              }}
              aria-label="Next Chord"
              tabIndex={0}
              type="button"
              style={{ minHeight: 56, color: "var(--brand-purple)" }}
            >
              Next Chord
            </button>
          </>
        )}
      </div>
    </div>
  );
}
