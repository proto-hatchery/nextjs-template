"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { BrandButton } from "@workspace/brand/components/brand-button";
import { MoreHorizontal, Plus } from "lucide-react";
import * as React from "react";
import { useState } from "react";

import type { TodoGroups, TodoItem } from "../../types/todo";
import { TaskList } from "./components/task-list";
import { TodoEmptyState } from "./components/todo-empty-state";
import { TodoForm } from "./components/todo-form";
import { TodoGroup } from "./components/todo-group";
import { useTodos } from "./hooks/use-todos";
import { startOfDay } from "./utils/date";

export function TodoSection() {
  const { items, addItem, toggleItem, removeItem, clearCompleted, isHydrated, error } = useTodos();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    overdue: true,
    today: true,
    completed: false,
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const groups = React.useMemo<TodoGroups>(() => {
    const now = startOfDay(new Date());
    const overdue: TodoItem[] = [];
    const today: TodoItem[] = [];
    const completed: TodoItem[] = [];

    items.forEach((it) => {
      if (it.isCompleted) {
        completed.push(it);
      } else if (it.dueDateISO) {
        const d = startOfDay(new Date(it.dueDateISO));
        if (d < now) {
          overdue.push(it);
        } else {
          today.push(it);
        }
      } else {
        today.push(it);
      }
    });

    return { overdue, today, completed };
  }, [items]);

  if (!isHydrated) return null;

  if (error) {
    return (
      <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
        Não foi possível carregar as tarefas agora.
      </div>
    );
  }

  if (items.length === 0 && !isFormVisible) {
    return <TodoEmptyState onCreateTask={() => setIsFormVisible(true)} />;
  }

  const hasItems = items.length > 0;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-foreground">Tarefas</h2>
        <div className="flex items-center gap-1">
          <BrandButton
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsFormVisible(!isFormVisible)}
          >
            <Plus className="h-4 w-4" />
          </BrandButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BrandButton variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </BrandButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={clearCompleted} disabled={groups.completed.length === 0}>
                Limpar concluídas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="safe-scroll min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {isFormVisible && (
          <div className="mb-4 rounded-lg border bg-muted/30 pt-2">
            <TodoForm
              onAdd={(title, priority, dueDate) => {
                addItem(title, priority, dueDate);
                setIsFormVisible(false);
              }}
              autoFocus
            />
          </div>
        )}

        {hasItems && (
          <div className="space-y-4">
            {groups.overdue.length > 0 && (
              <TodoGroup
                label="Em atraso"
                count={groups.overdue.length}
                isOpen={openGroups.overdue ?? false}
                onToggle={() => toggleGroup("overdue")}
              >
                <TaskList items={groups.overdue} onToggle={toggleItem} onRemove={removeItem} />
              </TodoGroup>
            )}

            <TodoGroup
              label="Hoje"
              count={groups.today.length}
              isOpen={openGroups.today ?? false}
              onToggle={() => toggleGroup("today")}
            >
              <TaskList items={groups.today} onToggle={toggleItem} onRemove={removeItem} />
            </TodoGroup>

            {groups.completed.length > 0 && (
              <TodoGroup
                label="Concluídas"
                count={groups.completed.length}
                isOpen={openGroups.completed ?? false}
                onToggle={() => toggleGroup("completed")}
              >
                <TaskList items={groups.completed} onToggle={toggleItem} onRemove={removeItem} />
              </TodoGroup>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
