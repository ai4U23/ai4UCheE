// Subscribe the calling workbench to WorkbenchMutationCommands targeted at it (or broadcasts)
// and apply the param map. Keeps each workbench's wiring to a one-line hook call.
import React, { useEffect, useRef } from 'react';
import { subscribeWorkbenchMutation, type WorkbenchId } from '../actions/view-screen';

export function useWorkbenchMutations(
  workbench: WorkbenchId,
  apply: (params: Record<string, number | string>) => void,
): void {
  const applyRef = useRef(apply);
  applyRef.current = apply;
  useEffect(
    () =>
      subscribeWorkbenchMutation((cmd) => {
        if (cmd.targetWorkbench && cmd.targetWorkbench !== workbench) return;
        applyRef.current(cmd.params);
      }),
    [workbench],
  );
}
