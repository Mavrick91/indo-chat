import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type LearnedWordsContextValue = {
  pendingWord: string;
  pendingTranslation: string;
  setPendingWord: (word: string) => void;
  setPendingTranslation: (translation: string) => void;
  clearPending: () => void;
  lastFilledField: "word" | "translation" | null;
};

const LearnedWordsContext = createContext<LearnedWordsContextValue | null>(
  null,
);

type Props = {
  children: React.ReactNode;
};

export function LearnedWordsProvider({ children }: Props) {
  const [pendingWord, setPendingWordState] = useState("");
  const [pendingTranslation, setPendingTranslationState] = useState("");
  const [lastFilledField, setLastFilledField] = useState<
    "word" | "translation" | null
  >(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  const setPendingWord = useCallback(function setPendingWord(word: string) {
    setPendingWordState(word);
    setLastFilledField("word");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLastFilledField(null), 600);
  }, []);

  const setPendingTranslation = useCallback(function setPendingTranslation(
    translation: string,
  ) {
    setPendingTranslationState(translation);
    setLastFilledField("translation");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLastFilledField(null), 600);
  }, []);

  const clearPending = useCallback(function clearPending() {
    setPendingWordState("");
    setPendingTranslationState("");
    setLastFilledField(null);
    clearTimeout(timerRef.current);
  }, []);

  const value = useMemo(
    () => ({
      pendingWord,
      pendingTranslation,
      setPendingWord,
      setPendingTranslation,
      clearPending,
      lastFilledField,
    }),
    [
      pendingWord,
      pendingTranslation,
      setPendingWord,
      setPendingTranslation,
      clearPending,
      lastFilledField,
    ],
  );

  return (
    <LearnedWordsContext.Provider value={value}>
      {children}
    </LearnedWordsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLearnedWords() {
  const context = useContext(LearnedWordsContext);
  if (!context) {
    throw new Error(
      "useLearnedWords must be used within a LearnedWordsProvider",
    );
  }
  return context;
}
