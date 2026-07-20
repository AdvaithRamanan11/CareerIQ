import { create } from 'zustand';

export const useStore = create((set) => ({
  // Shared profile inputs
  college: null,
  major: null,
  job: null,
  area: "Suburban",
  region: "National",   // "Where do you plan to work?" — default = national average
  experience: "Entry",
  incomeKey: "mid1",

  // Loan estimator snapshot for Smart Auto-Fill
  loanSnapshot: null,

  // Navigation
  activeTool: "predict",

  setCollege: (college) => set({ college }),
  setMajor: (major) => set({ major, job: null }),
  setJob: (job) => set({ job }),
  setArea: (area) => set({ area }),
  setRegion: (region) => set({ region }),
  setExperience: (experience) => set({ experience }),
  setIncomeKey: (incomeKey) => set({ incomeKey }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setLoanSnapshot: (loanSnapshot) => set({ loanSnapshot }),
}));
