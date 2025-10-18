// ABOUTME: Utility function for generating CSS class names for character comparison display
// ABOUTME: Simplifies nested ternaries when applying match/wrong/missing/extra character styles
import { CharacterMatch } from '../services/practiceLogic';

export function getCharacterClassName(
  match: CharacterMatch,
  styles: Record<string, string>
): string {
  const baseClass = styles.char;

  switch (match) {
    case 'match':
      return `${baseClass} ${styles.charMatch}`;
    case 'missing':
      return `${baseClass} ${styles.charMissing}`;
    case 'extra':
      return `${baseClass} ${styles.charExtra}`;
    case 'wrong':
      return `${baseClass} ${styles.charWrong}`;
  }
}
