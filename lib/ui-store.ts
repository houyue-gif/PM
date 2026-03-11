"use client";

import { create } from "zustand";

type TaskView = "list" | "board" | "calendar";
type MyTaskFilter = "owned" | "watching" | "overdue" | "today";

interface UIState {
  taskView: TaskView;
  myTaskFilter: MyTaskFilter;
  setTaskView: (view: TaskView) => void;
  setMyTaskFilter: (filter: MyTaskFilter) => void;
}

export const useUIStore = create<UIState>((set) => ({
  taskView: "list",
  myTaskFilter: "owned",
  setTaskView: (taskView) => set({ taskView }),
  setMyTaskFilter: (myTaskFilter) => set({ myTaskFilter })
}));
