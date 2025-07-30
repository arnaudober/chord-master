import { useState, useEffect, useRef } from "react";
import type { Props } from "./model";
import { Piano, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import * as Tone from "tone";
import { RotateCcw } from "lucide-react";

export default function ChordCard({ chord, onNext }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const [samplerLoaded, setSamplerLoaded] = useState(false);
  const synthRef = useRef<Tone.Sampler | null>(null);

  // Initialize synth with better sound
  useEffect(() => {
    if (!synthRef.current) {
      // Use Tone.js Sampler with piano samples for realistic sound
      const piano = new Tone.Sampler({
        urls: {
          "C4": "C4.mp3",
          "D#4": "Ds4.mp3", 
          "F#4": "Fs4.mp3",
        },
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        release: 1.2,
        attack: 0.01,
        onload: () => {
          setSamplerLoaded(true);
        }
      }).toDestination();

      // Add subtle reverb for acoustic feel
      const reverb = new Tone.Reverb({
        decay: 2,
        wet: 0.15,
        preDelay: 0.02
      });

      piano.connect(reverb);
      reverb.toDestination();

      synthRef.current = piano;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.dispose();
        synthRef.current = null;
      }
    };
  }, []);

  // Clear active notes when chord changes
  useEffect(() => {
    setActiveNotes([]);
  }, [chord]);

  // Play chord sound when flipped
  async function playChord() {
    if (!synthRef.current || !samplerLoaded) return;
    
    // Clear any existing active notes
    setActiveNotes([]);
    
    // Sort notes by their position on the piano (left to right)
    const sortedNotes = [...transposedChordNotes].sort((a, b) => {
      const midiA = MidiNumbers.fromNote(a);
      const midiB = MidiNumbers.fromNote(b);
      return midiA - midiB;
    });
    
    // Play notes one after the other (arpeggio) with visual animation
    sortedNotes.forEach((note, index) => {
      const delay = index * 0.25; // 250ms delay between each note for better flow
      
      // Add note to active notes after delay
      setTimeout(() => {
        setActiveNotes(prev => [...prev, note]);
      }, delay * 1000);
      
      synthRef.current!.triggerAttackRelease(note, "1.2", `+${delay}`);
    });
  }



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

  // Use a fixed range from C to C (one octave) - C4 to C5
  const first = MidiNumbers.fromNote("C4"); // C4 = 60
  const last = MidiNumbers.fromNote("C5");  // C5 = 72

  // Transpose chord notes to fit within our C4-C5 range
  function transposeChordNotes(notes: string[]): string[] {
    return notes.map(note => {
      const midiNumber = MidiNumbers.fromNote(note);
      const noteIndex = midiNumber % 12;
      // Transpose to octave 4 (C4-C5 range)
      const transposedMidi = noteIndex + 60; // 60 = C4
      return MidiNumbers.getAttributes(transposedMidi).note;
    });
  }

  // Get transposed chord notes for display
  const transposedChordNotes = transposeChordNotes(chord.keys);

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div
        className="glass w-full max-w-[420px] min-w-[220px] h-[280px] text-center transition-all duration-300 rounded-2xl flex flex-col items-center justify-center"
        style={{
          willChange: "transform, opacity",
        }}
      >
        {!flipped ? (
          <>
            <div
              className="w-full flex justify-center items-center smooth flex-1"
              style={{ pointerEvents: "none" }}
            >
              <h1
                className="chord-name smooth text-4xl sm:text-5xl md:text-6xl font-extrabold"
                style={{ letterSpacing: "0.03em" }}
              >
                {chord.name}
              </h1>
            </div>
            <button
              className={`my-2 px-6 py-4 w-full max-w-xs font-bold text-xl text-zinc-900 rounded-2xl transition-all duration-200 smooth overflow-hidden relative`}
              onClick={() => {
                setFlipped(true);
                playChord();
              }}
              aria-label="Reveal chord"
              tabIndex={0}
              type="button"
              style={{ minHeight: 56, color: "var(--brand-purple)" }}
            >
              Reveal
            </button>
          </>
        ) : (
          <>
            <div
              className="rounded-2xl w-full flex justify-center smooth flex-1 relative"
              style={{ pointerEvents: "none" }}
            >
              <button
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/10 backdrop-blur-sm flex items-center justify-center transition-all duration-200 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  playChord();
                }}
                aria-label="Replay chord"
                type="button"
                style={{ pointerEvents: "auto" }}
              >
                <RotateCcw size={16} color="rgba(0, 0, 0, 0.8)" />
              </button>
              <Piano
                noteRange={{ first, last }}
                playNote={() => {}}
                stopNote={() => {}}
                renderNoteLabel={({ midiNumber }) => {
                  // Use the same note name format as our transposed notes
                  const noteName = MidiNumbers.getAttributes(midiNumber).note;
                  const isActive = activeNotes.includes(noteName);
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
                activeNotes={activeNotes.map((key) => MidiNumbers.fromNote(key))}
              />
            </div>
            <button
              className={`my-2 px-6 py-4 w-full max-w-xs font-bold text-xl text-zinc-900 rounded-2xl transition-all duration-200 smooth overflow-hidden relative`}
              onClick={() => {
                setFlipped(false);
                setActiveNotes([]); // Clear active notes when moving to next chord
                onNext();
              }}
              aria-label="Next chord"
              tabIndex={0}
              type="button"
              style={{ minHeight: 56, color: "var(--brand-purple)" }}
            >
              Next
            </button>
          </>
        )}
      </div>
    </div>
  );
}
