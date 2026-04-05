import { supabase } from "./supabase";

// ---- Interfaces ----

export interface Sphere {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  is_default: boolean;
  target_level: number;
  current_level: number;
  created_at: string;
  updated_at: string;
  projects?: Project[];
}

export interface Project {
  id: string;
  sphere_id: string;
  user_id: string;
  title: string;
  description: string;
  point_a: string;
  point_b: string;
  progress: number;
  status: "active" | "completed" | "paused" | "archived";
  start_date: string;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
}

// ---- Spheres ----

export async function fetchSpheres(): Promise<Sphere[]> {
  const { data, error } = await supabase
    .from("spheres")
    .select("*")
    .order("sort_order");

  if (error) throw error;
  return data || [];
}

export async function fetchSphere(id: string): Promise<Sphere | null> {
  const { data, error } = await supabase
    .from("spheres")
    .select("*, projects(*, milestones(*))")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createSphere(
  userId: string,
  sphere: { name: string; icon: string; color: string; target_level: number }
): Promise<Sphere> {
  const { data: existing } = await supabase
    .from("spheres")
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from("spheres")
    .insert({
      user_id: userId,
      name: sphere.name,
      icon: sphere.icon,
      color: sphere.color,
      target_level: sphere.target_level,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSphere(
  id: string,
  updates: Partial<Pick<Sphere, "name" | "icon" | "color" | "target_level" | "current_level" | "sort_order">>
): Promise<void> {
  const { error } = await supabase
    .from("spheres")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteSphere(id: string): Promise<void> {
  const { error } = await supabase.from("spheres").delete().eq("id", id);
  if (error) throw error;
}

// ---- Projects ----

export async function fetchProjects(sphereId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("sphere_id", sphereId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*, milestones(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProject(
  userId: string,
  sphereId: string,
  project: { title: string; description: string; point_a: string; point_b: string; target_date?: string }
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      sphere_id: sphereId,
      title: project.title,
      description: project.description,
      point_a: project.point_a,
      point_b: project.point_b,
      target_date: project.target_date || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<Project, "title" | "description" | "point_a" | "point_b" | "progress" | "status" | "target_date">>
): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// ---- Milestones ----

export async function createMilestone(
  userId: string,
  projectId: string,
  title: string
): Promise<Milestone> {
  const { data: existing } = await supabase
    .from("milestones")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from("milestones")
    .insert({
      user_id: userId,
      project_id: projectId,
      title,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleMilestone(
  id: string,
  isCompleted: boolean
): Promise<void> {
  const { error } = await supabase
    .from("milestones")
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteMilestone(id: string): Promise<void> {
  const { error } = await supabase.from("milestones").delete().eq("id", id);
  if (error) throw error;
}

// ---- Progress recalculation ----

export async function recalculateSphereLevel(sphereId: string): Promise<void> {
  const { data: projects } = await supabase
    .from("projects")
    .select("progress")
    .eq("sphere_id", sphereId)
    .in("status", ["active", "completed"]);

  if (!projects || projects.length === 0) {
    await updateSphere(sphereId, { current_level: 0 });
    return;
  }

  const avgProgress = projects.reduce((sum, p) => sum + p.progress, 0) / projects.length;
  const level = Math.round((avgProgress / 10) * 10) / 10; // round to 1 decimal

  await updateSphere(sphereId, { current_level: level });
}
