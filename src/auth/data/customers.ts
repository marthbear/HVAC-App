/**
 * Customer model.
 *
 */
export type Customer = {
  id: string;
  name: string;
  address: string;
  phone: string;
  assignedEmployeeId: string;
};

/**
 * Mock customer data.
 *
 */
export const CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: "Smith Residence",
    address: "123 Main St, Richmond, VA",
    phone: "(804) 555-1234",
    assignedEmployeeId: "employee-001",
  },
  {
    id: "2",
    name: "Johnson Apartments",
    address: "456 Oak Ave, Henrico, VA",
    phone: "(804) 555-5678",
    assignedEmployeeId: "employee-002",
  },
  {
    id: "3",
    name: "Baker Home",
    address: "789 Pine Rd, Chesterfield, VA",
    phone: "(804) 555-9012",
    assignedEmployeeId: "employee-001",
  },
];

/**
 * Simulates fetching a customer by ID.
 *
 */
export function getCustomerById(id: string): Customer | undefined {
  return CUSTOMERS.find((customer) => customer.id === id);
}