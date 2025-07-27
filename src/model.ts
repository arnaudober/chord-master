export type Chord = {
  name: string;
  keys: string[];
};

export type Props = {
  chord: Chord;
  onNext: () => void;
};
