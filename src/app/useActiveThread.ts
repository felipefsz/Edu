import { getThreadById } from '../utils/selectors';
import { useApp } from './AppState';

export function useActiveThread() {
  const { state } = useApp();
  return getThreadById(state, state.ui.activeThreadId);
}
