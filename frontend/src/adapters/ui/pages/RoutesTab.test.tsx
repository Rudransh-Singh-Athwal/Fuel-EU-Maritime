import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoutesTab } from "./RoutesTab";

describe("RoutesTab", () => {
  it("renders filter inputs", () => {
    render(<RoutesTab />);

    expect(
      screen.getByPlaceholderText("Filter Vessel Type"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Filter Fuel Type")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Filter Year")).toBeInTheDocument();
  });

  it("renders table headers", () => {
    render(<RoutesTab />);

    expect(screen.getByText("Route ID")).toBeInTheDocument();
    expect(screen.getByText("Vessel Type")).toBeInTheDocument();
    expect(screen.getByText("Fuel Type")).toBeInTheDocument();
    expect(screen.getByText("GHG Intensity")).toBeInTheDocument();
  });
});
