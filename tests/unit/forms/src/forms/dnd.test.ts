/* oxlint-disable */
import { describe, expect, it } from "vitest";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  CSS,
} from "@workspace/forms/dnd";

describe("dnd re-exports", () => {
  it("exports core DnD kit primitives", () => {
    expect(closestCenter).toBeTypeOf("function");
    expect(DndContext).toBeDefined();
    expect(DragOverlay).toBeDefined();
    expect(KeyboardSensor).toBeDefined();
    expect(MouseSensor).toBeDefined();
    expect(PointerSensor).toBeDefined();
    expect(TouchSensor).toBeDefined();
    expect(useDraggable).toBeTypeOf("function");
    expect(useDroppable).toBeTypeOf("function");
    expect(useSensor).toBeTypeOf("function");
    expect(useSensors).toBeTypeOf("function");
  });

  it("exports sortable primitives", () => {
    expect(arrayMove).toBeTypeOf("function");
    expect(SortableContext).toBeDefined();
    expect(sortableKeyboardCoordinates).toBeDefined();
    expect(useSortable).toBeTypeOf("function");
    expect(verticalListSortingStrategy).toBeDefined();
  });

  it("exports CSS utility", () => {
    expect(CSS).toBeDefined();
    expect(CSS.Transform).toBeDefined();
  });
});
