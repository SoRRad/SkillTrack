import { useCallback, useMemo } from 'react';
import { useAppState } from '../store/AppContext';

function cycleOrder(order: number, delta: -1 | 1, total: number): number {
  return ((((order - 1 + delta) % total) + total) % total) + 1;
}

export function useWorkoutPlan() {
  const { activePlan, activeSettings, updateActiveSettings } = useAppState();

  const activeOrder = activeSettings?.activeWorkoutDayOrder ?? 1;
  const dayCount = activePlan?.days.length ?? 1;

  const activeDay = useMemo(
    () => activePlan?.days.find((day) => day.order === activeOrder) ?? activePlan?.days[0] ?? null,
    [activeOrder, activePlan]
  );
  const nextDay = useMemo(
    () => activePlan?.days.find((day) => day.order === cycleOrder(activeOrder, 1, dayCount)) ?? activePlan?.days[0] ?? null,
    [activeOrder, activePlan, dayCount]
  );
  const previousDay = useMemo(
    () => activePlan?.days.find((day) => day.order === cycleOrder(activeOrder, -1, dayCount)) ?? activePlan?.days[0] ?? null,
    [activeOrder, activePlan, dayCount]
  );

  const setActiveDayOrder = useCallback(
    (order: number) => {
      if (!activeSettings) return;
      void updateActiveSettings({ activeWorkoutDayOrder: order });
    },
    [activeSettings, updateActiveSettings]
  );

  const goToNextDay = useCallback(() => {
    setActiveDayOrder(cycleOrder(activeOrder, 1, dayCount));
  }, [activeOrder, dayCount, setActiveDayOrder]);

  const goToPreviousDay = useCallback(() => {
    setActiveDayOrder(cycleOrder(activeOrder, -1, dayCount));
  }, [activeOrder, dayCount, setActiveDayOrder]);

  return {
    plan: activePlan,
    activeDay,
    nextDay,
    previousDay,
    activeOrder,
    goToNextDay,
    goToPreviousDay,
    setActiveDayOrder
  };
}
