import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  SchedulableJob,
  getAllJobs,
  getUnscheduledJobs,
  getScheduledJobs,
  completeJob,
  startJob,
} from "../../auth/data/scheduling";

interface JobsState {
  items: SchedulableJob[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  filter: "all" | "unscheduled" | "scheduled" | "in_progress" | "completed";
}

const initialState: JobsState = {
  items: [],
  status: "idle",
  error: null,
  filter: "all",
};

export const fetchAllJobs = createAsyncThunk(
  "jobs/fetchAll",
  async (companyId?: string) => {
    const jobs = await getAllJobs(companyId);
    return jobs;
  }
);

export const fetchUnscheduledJobs = createAsyncThunk(
  "jobs/fetchUnscheduled",
  async (companyId?: string) => {
    const jobs = await getUnscheduledJobs(companyId);
    return jobs;
  }
);

export const fetchScheduledJobs = createAsyncThunk(
  "jobs/fetchScheduled",
  async (companyId?: string) => {
    const jobs = await getScheduledJobs(companyId);
    return jobs;
  }
);

export const startJobAction = createAsyncThunk(
  "jobs/start",
  async (jobId: string) => {
    await startJob(jobId);
    return jobId;
  }
);

export const completeJobAction = createAsyncThunk(
  "jobs/complete",
  async (jobId: string) => {
    await completeJob(jobId);
    return jobId;
  }
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearJobsError(state) {
      state.error = null;
    },
    setJobsFilter(state, action: PayloadAction<JobsState["filter"]>) {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all jobs
      .addCase(fetchAllJobs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAllJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAllJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch jobs";
      })
      // Fetch unscheduled jobs
      .addCase(fetchUnscheduledJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      // Fetch scheduled jobs
      .addCase(fetchScheduledJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      // Start job
      .addCase(startJobAction.fulfilled, (state, action) => {
        const job = state.items.find((j) => j.id === action.payload);
        if (job) {
          job.status = "in_progress";
        }
      })
      .addCase(startJobAction.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to start job";
      })
      // Complete job
      .addCase(completeJobAction.fulfilled, (state, action) => {
        const job = state.items.find((j) => j.id === action.payload);
        if (job) {
          job.status = "completed";
          job.completedAt = new Date().toISOString();
        }
      })
      .addCase(completeJobAction.rejected, (state, action) => {
        state.error = action.error.message ?? "Failed to complete job";
      });
  },
});

export const { clearJobsError, setJobsFilter } = jobsSlice.actions;

// Selectors
export const selectAllJobs = (state: { jobs: JobsState }) => state.jobs.items;

export const selectFilteredJobs = (state: { jobs: JobsState }) => {
  const { items, filter } = state.jobs;
  if (filter === "all") return items;
  return items.filter((job) => job.status === filter);
};

export const selectJobsByStatus = (status: SchedulableJob["status"]) =>
  (state: { jobs: JobsState }) => state.jobs.items.filter((j) => j.status === status);

export const selectJobsStatus = (state: { jobs: JobsState }) => state.jobs.status;

export const selectJobsError = (state: { jobs: JobsState }) => state.jobs.error;

export const selectJobsFilter = (state: { jobs: JobsState }) => state.jobs.filter;

export default jobsSlice.reducer;
