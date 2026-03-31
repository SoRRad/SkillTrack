import { useCallback, useMemo } from 'react';
import { useAppState } from '../store/AppContext';

function cycleOrder(order: 1 | 2 | 3, delta: -1 | 1): 1 | 2 | 3 {
  return ((((order - 1 + delta) % 3) + 3) % 3) + 1 as 1 | 2 | 3;
}

export function useWorkoutPlan() {
  const { plan, settings, updateSettings } = useAppState();

  const activeOrder = settings.activeWorkoutDayOrder;

  const activeDay = useMemo(
    () => plan.days.find((d) => d.order === activeOrder) ?? plan.days[0],
    [plan.days, activeOrder]
  );

  const nextDay = useMemo(
    () => plan.days.find((d) => d.order === cycleOrder(activeOrder, 1)) ?? plan.days[0],
    [plan.days, activeOrder]
  );

  const prevDay = useMemo(
    () => plan.days.find((d) => d.order === cycleOrder(activeOrder, -1)) ?? plan.days[0],
    [plan.days, activeOrder]
  );

  const goToPreviousDay = useCallback(() => {
    void updateSettings({ activeWorkoutDayOrder: cycleOrder(activeOrder, -1) });
  }, [activeOrder, updateSettings]);

  const goToNextDay = useCallback(() => {
    void updateSettings({ activeWorkoutDayOrder: cycleOrder(activeOrder, 1) });
  }, [activeOrder, updateSettings]);

  const setActiveDayOrder = useCallback(
    (order: 1 | 2 | 3) => {
      void updateSettings({ activeWorkoutDayOrder: order });
    },
    [updateSettings]
  );

  return {
    plan,
    activeDay,
    activeOrder,
    nextDay,
    prevDay,
    goToPreviousDay,
    goToNextDay,
    setActiveDayOrder
  };
}
