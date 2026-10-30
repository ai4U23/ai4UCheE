// Subscribe the calling workbench to WorkbenchMutationCommands targeted at it (or broadcasts)
// and apply the param map. Keeps each workbench's wiring to a one-line hook call.
import { useEffect, useRef } from 'react';
import {
  consumePendingMutation,
  subscribeWorkbenchMutation,
  type WorkbenchId,
} from '../actions/view-screen';

export function useWorkbenchMutations(
  workbench: WorkbenchId,
  apply: (params: Record<string, number | string>) => void,
): void {
  const applyRef = useRef(apply);
  applyRef.current = apply;
  useEffect(() => {
    const queued = consumePendingMutation(workbench);
    if (queued) {
      applyRef.current(queued.params);
    }
    return subscribeWorkbenchMutation((cmd) => {
      if (cmd.targetWorkbench && cmd.targetWorkbench !== workbench) return;
      consumePendingMutation(workbench);
      applyRef.current(cmd.params);
    });
  }, [workbench]);
}
