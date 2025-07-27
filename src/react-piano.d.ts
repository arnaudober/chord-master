// src/react-piano.d.ts
declare module "react-piano" {
  import * as React from "react";
  export interface PianoProps {
    noteRange: { first: number; last: number };
    playNote: (midiNumber: number) => void;
    stopNote: (midiNumber: number) => void;
    renderNoteLabel?: (args: { midiNumber: number }) => React.ReactNode;
    activeNotes?: number[];
    disabled?: boolean;
    width?: number;
    keyboardShortcuts?: unknown;
    className?: string;
    // Add more props as needed
  }
  export class Piano extends React.Component<PianoProps> {}
  export const MidiNumbers: {
    fromNote: (note: string) => number;
    getAttributes: (midiNumber: number) => { note: string; octave: number };
  };
}

declare module "react-piano/dist/styles.css";
