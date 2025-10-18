// ABOUTME: Custom hook for loading and filtering speech synthesis voices
// ABOUTME: Manages voice list updates and provides optional filtering capability
import { useState, useEffect, useRef } from 'react';
import { speechService } from '../services/speech';
import { isBrowser } from '../utils/browser';

export function useVoices(
  filter?: (voice: SpeechSynthesisVoice) => boolean
): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const filterRef = useRef(filter);

  filterRef.current = filter;

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechService.getVoices();
      const filteredVoices = filterRef.current
        ? availableVoices.filter(filterRef.current)
        : availableVoices;
      setVoices(filteredVoices);
    };

    loadVoices();

    if (isBrowser() && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (isBrowser() && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  return voices;
}
