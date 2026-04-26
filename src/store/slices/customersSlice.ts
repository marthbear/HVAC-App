import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Customer, CUSTOMERS, getCustomerById } from "../../auth/data/customers";

interface CustomersState {
  items: Customer[];
  selectedCustomerId: string | null;
  searchQuery: string;
}

const initialState: CustomersState = {
  items: CUSTOMERS,
  selectedCustomerId: null,
  searchQuery: "",
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    selectCustomer(state, action: PayloadAction<string | null>) {
      state.selectedCustomerId = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    addCustomer(state, action: PayloadAction<Customer>) {
      state.items.push(action.payload);
    },
    updateCustomer(state, action: PayloadAction<Customer>) {
      const index = state.items.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteCustomer(state, action: PayloadAction<string>) {
      const index = state.items.findIndex((c) => c.id === action.payload);
      if (index !== -1) {
        state.items.splice(index, 1);
        if (state.selectedCustomerId === action.payload) {
          state.selectedCustomerId = null;
        }
      }
    },
  },
});

export const {
  selectCustomer,
  setSearchQuery,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} = customersSlice.actions;

// Selectors
export const selectAllCustomers = (state: { customers: CustomersState }) =>
  state.customers.items;

export const selectFilteredCustomers = (state: { customers: CustomersState }) => {
  const { items, searchQuery } = state.customers;
  if (!searchQuery.trim()) return items;

  const query = searchQuery.toLowerCase();
  return items.filter(
    (c) =>
      c.name.toLowerCase().includes(query) ||
      c.address.toLowerCase().includes(query) ||
      c.phone.includes(query)
  );
};

export const selectSelectedCustomer = (state: { customers: CustomersState }) =>
  state.customers.items.find((c) => c.id === state.customers.selectedCustomerId) ?? null;

export const selectSelectedCustomerId = (state: { customers: CustomersState }) =>
  state.customers.selectedCustomerId;

export const selectSearchQuery = (state: { customers: CustomersState }) =>
  state.customers.searchQuery;

export const selectCustomersByEmployee = (employeeId: string) =>
  (state: { customers: CustomersState }) =>
    state.customers.items.filter((c) => c.assignedEmployeeId === employeeId);

export default customersSlice.reducer;
