export interface TodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAtISO: string;
  priority: "none" | "low" | "medium" | "high";
  dueDateISO?: string;
}

export type TodoFilterKey = "all" | "active" | "completed";
export type TodoGroupKey = "overdue" | "today" | "completed";

export interface TodoGroups {
  overdue: TodoItem[];
  today: TodoItem[];
  completed: TodoItem[];
}

export interface UseTodosReturn {
  items: TodoItem[];
  addItem: (title: string, priority: TodoItem["priority"], dueDate?: Date) => void;
  toggleItem: (id: string, checked: boolean) => void;
  removeItem: (id: string) => void;
  clearCompleted: () => void;
  isHydrated: boolean;
  error: string | null;
}
