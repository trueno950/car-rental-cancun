import type { ReservationBlockedDate } from "@rental/validations";

export interface ReservationRequestFormCopy {
  blockedDatesLabel: string;
  dateRangeDescription: string;
  heading: string;
  helper: string;
  locationDescription: string;
  locationLabel: string;
  submit: string;
  submitError: string;
  success: string;
  timezoneDescription: string;
  timezoneLabel: string;
}

export interface ReservationRequestFormProps {
  blockedDates: readonly ReservationBlockedDate[];
  copy: ReservationRequestFormCopy;
}
