// @vitest-environment jsdom

import React, { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReservationRequestFormValues } from "@rental/validations";

const { dynamicMock, submitReservationAvailabilityActionMock } = vi.hoisted(() => ({
  dynamicMock: vi.fn((_, options?: { ssr?: boolean }) => {
    return function DynamicMapStub(props: { locations: readonly unknown[]; title: string }) {
      return (
        <div
          data-location-count={String(props.locations.length)}
          data-ssr={String(options?.ssr)}
          data-testid="dynamic-map"
          data-title={props.title}
        />
      );
    };
  }),
  submitReservationAvailabilityActionMock: vi.fn(),
}));

vi.mock("next/dynamic", () => ({
  default: dynamicMock,
}));

vi.mock("../../src/features/reservations/actions/reservation-actions", () => ({
  submitReservationAvailabilityAction: submitReservationAvailabilityActionMock,
}));

import { MapView } from "@features/map";
import { Calendar, Form } from "@shared/components/ui";
import {
  ReservationDateRangeField,
  ReservationRequestForm,
  formatReservationDateRange,
} from "../../src/features/reservations";

const reservationFormCopy = {
  blockedDatesLabel: "Travel dates",
  dateRangeDescription: "Choose your pickup and return window",
  heading: "Reservation request",
  helper: "Shared frontend contract demo",
  locationDescription: "Pickup point",
  locationLabel: "Pickup location",
  submit: "Check availability",
  submitError: "Submission failed",
  success: "Availability loaded",
  timezoneDescription: "Detected timezone",
  timezoneLabel: "Timezone",
};

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mountedRoots: Array<{ root: Root; container: HTMLDivElement }> = [];

function render(ui: ReactNode) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });

  mountedRoots.push({ root, container });

  return { container };
}

afterEach(() => {
  while (mountedRoots.length > 0) {
    const mounted = mountedRoots.pop();

    if (!mounted) {
      continue;
    }

    act(() => {
      mounted.root.unmount();
    });
    mounted.container.remove();
  }

  submitReservationAvailabilityActionMock.mockReset();
  document.body.innerHTML = "";
});

function ReservationDateRangeFieldHarness() {
  const form = useForm<ReservationRequestFormValues>({
    defaultValues: {
      pickupLocation: "Airport",
      timezone: "America/Cancun",
      dateRange: {
        from: new Date("2026-07-10T10:00:00.000Z"),
        to: new Date("2026-07-13T10:00:00.000Z"),
      },
    },
  });

  return (
    <Form {...form}>
      <ReservationDateRangeField
        blockedDates={[]}
        control={form.control}
        description="Choose dates"
        label="Travel dates"
        name="dateRange"
        minDate={new Date("2026-07-01T00:00:00.000Z")}
      />
    </Form>
  );
}

describe("verification closure", () => {
  it("blocks invalid RHF submissions before the proxy action runs", async () => {
    const { container } = render(<ReservationRequestForm blockedDates={[]} copy={reservationFormCopy} />);

    const formElement = container.querySelector("form");

    expect(formElement).toBeInstanceOf(HTMLFormElement);

    await act(async () => {
      formElement?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(submitReservationAvailabilityActionMock).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Invalid input: expected object, received undefined");
  });

  it("round-trips a controlled Calendar value through the RHF field label", () => {
    const { container } = render(<ReservationDateRangeFieldHarness />);

    expect(container.textContent).toContain(
      formatReservationDateRange({
        from: new Date("2026-07-10T10:00:00.000Z"),
        to: new Date("2026-07-13T10:00:00.000Z"),
      }),
    );
  });

  it("keeps disabled calendar dates non-interactive", async () => {
    const onSelect = vi.fn();
    const blockedDate = new Date("2026-07-12T00:00:00.000Z");

    render(
      <Calendar
        defaultMonth={new Date("2026-07-01T00:00:00.000Z")}
        disabled={(date) => date.toDateString() === blockedDate.toDateString()}
        mode="single"
        onSelect={onSelect}
        selected={undefined}
      />,
    );

    const disabledDayButton = document.querySelector<HTMLButtonElement>(
      `button[data-day="${blockedDate.toLocaleDateString()}"]`,
    );

    expect(disabledDayButton).toBeDefined();

    await act(async () => {
      disabledDayButton?.click();
    });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders the map wrapper through a single dynamic SSR-safe boundary", () => {
    render(
      <MapView
        description="Pickup points"
        emptyLabel="No locations"
        locations={[
          {
            id: "airport",
            name: "Airport",
            note: "Arrivals",
            position: [21.0365, -86.8771],
          },
        ]}
        title="Map"
      />,
    );

    expect(dynamicMock).toHaveBeenCalled();
    expect(dynamicMock.mock.calls[0]?.[1]).toMatchObject({ ssr: false });

    const renderedMap = document.querySelector('[data-testid="dynamic-map"]');

    expect(renderedMap?.getAttribute("data-title")).toBe("Map");
    expect(renderedMap?.getAttribute("data-location-count")).toBe("1");
    expect(renderedMap?.getAttribute("data-ssr")).toBe("false");
  });
});
