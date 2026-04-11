import { createContext, useContext } from "react";

export const ShipmentContext = createContext(null);

export function useShipments() {
  const ctx = useContext(ShipmentContext);
  if (!ctx) throw new Error("useShipments must be inside <ShipmentProvider>");
  return ctx;
}
