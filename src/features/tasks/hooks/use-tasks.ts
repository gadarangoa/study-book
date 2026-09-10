import { useCallback, useEffect, useState } from "react"
import {
  getByIndex,
  create as dbCreate,
  update as dbUpdate,
  remove as dbRemove,
} from "@/lib/db"
import type { Task, TaskFormData } from "../types"

export function useTasks(courseId: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    const all = await getByIndex("tasks", "courseId", courseId)
    setTasks(all)
    setIsLoading(false)
  }, [courseId])

  useEffect(() => {
    load()
  }, [load])

  const createTask = useCallback(
    async (data: TaskFormData): Promise<Task> => {
      const now = new Date().toISOString()
      const task: Task = {
        id: crypto.randomUUID(),
        courseId,
        title: data.title,
        dueDate: data.dueDate,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      }
      await dbCreate("tasks", task)
      await load()
      return task
    },
    [courseId, load]
  )

  const updateTask = useCallback(
    async (id: string, data: TaskFormData): Promise<Task> => {
      const found = tasks.find((t) => t.id === id)
      if (!found) throw new Error("Task not found")
      const updated: Task = {
        ...found,
        ...data,
        updatedAt: new Date().toISOString(),
      }
      await dbUpdate("tasks", updated)
      await load()
      return updated
    },
    [tasks, load]
  )

  const toggleTaskStatus = useCallback(
    async (id: string): Promise<void> => {
      const found = tasks.find((t) => t.id === id)
      if (!found) throw new Error("Task not found")
      const updated: Task = {
        ...found,
        status: found.status === "pending" ? "complete" : "pending",
        updatedAt: new Date().toISOString(),
      }
      await dbUpdate("tasks", updated)
      await load()
    },
    [tasks, load]
  )

  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      await dbRemove("tasks", id)
      await load()
    },
    [load]
  )

  const pendingTasks = tasks.filter((t) => t.status === "pending")
  const completedTasks = tasks.filter((t) => t.status === "complete")

  return {
    tasks,
    pendingTasks,
    completedTasks,
    isLoading,
    createTask,
    updateTask,
    toggleTaskStatus,
    deleteTask,
  }
}
