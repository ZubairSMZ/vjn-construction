export const WORKER_TRADES = [
  "MC",
  "MS",
  "FC",
  "Fitter",
  "Painter",
  "Carpenter",
  "Tiles Layer",
  "Gang MC",
  "Gang FC",
] as const;
export type WorkerTrade = (typeof WORKER_TRADES)[number];
export type WorkersMap = Partial<Record<WorkerTrade, number>>;

export const MATERIAL_OPTIONS = [
  { material: "Steel 8mm", unit: "Kg" },
  { material: "Steel 10mm", unit: "Kg" },
  { material: "Steel 12mm", unit: "Kg" },
  { material: "Steel 14mm", unit: "Kg" },
  { material: "Steel 16mm", unit: "Kg" },
  { material: "Cement", unit: "Bag" },
  { material: "Bricks", unit: "Piece" },
] as const;

export const MATERIAL_NAMES = MATERIAL_OPTIONS.map((m) => m.material);

export function defaultUnitFor(material: string): string {
  return MATERIAL_OPTIONS.find((m) => m.material === material)?.unit ?? "Piece";
}

export function sumWorkers(w: WorkersMap | null | undefined): number {
  if (!w) return 0;
  return Object.values(w).reduce((a, b) => a + (Number(b) || 0), 0);
}
