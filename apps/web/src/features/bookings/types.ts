import type { BookingResponse, BookingStatus } from "@rental/validations";

export const BOOKING_STATUS_TRANSITIONS: Record<
  BookingStatus,
  BookingStatus[]
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["active", "cancelled"],
  active: ["completed"],
  completed: [],
  cancelled: [],
};

export interface BookingFormCopy {
  heading: string;
  helper: string;
  vehicleLabel: string;
  dateRangeLabel: string;
  dateRangePlaceholder: string;
  notesLabel: string;
  notesPlaceholder: string;
  submit: string;
  submitting: string;
  submitError: string;
  conflictError: string;
}

export interface BookingFormProps {
  vehicleId: string;
  vehicleLabel: string;
  copy: BookingFormCopy;
}

export interface BookingStatusBadgeProps {
  status: BookingResponse["status"];
}

export interface DepositCallToActionProps {
  depositAmount: number;
  totalPrice: number;
  copy: {
    depositLabel: string;
    totalLabel: string;
    helper: string;
  };
}

export interface EmployeeBookingsTableCopy {
  heading: string;
  colId: string;
  colVehicle: string;
  colUser: string;
  colDates: string;
  colStatus: string;
  colTotal: string;
  colNotes: string;
  colActions: string;
  empty: string;
  actionLabels: Partial<Record<BookingStatus, string>>;
}

export interface EmployeeBookingsTableProps {
  bookings: BookingResponse[];
  copy: EmployeeBookingsTableCopy;
  transitionAction: (bookingId: string, status: BookingStatus) => Promise<void>;
}
