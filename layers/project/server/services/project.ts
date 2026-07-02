import type { CreateProject } from '#layers/project/shared/schemas/project'
import { db } from '@nuxthub/db'
import { projectMemberTable, projectTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'

export interface CreateProjectInput extends Partial<CreateProject> {
  orgId: string
  userId: string
  name: string
}

export async function createProject(input: CreateProjectInput) {
  const [project] = await db.insert(projectTable).values({
    name: input.name,
    description: input.description,
    status: input.status ?? 'active',
    organization_id: input.orgId,
    created_by: input.userId,
  }).returning()

  await db.insert(projectMemberTable).values({
    project_id: project!.id,
    user_id: input.userId,
    role: 'owner',
  })

  return project!
}

export async function deleteProject(id: string) {
  await db.delete(projectTable).where(eq(projectTable.id, id))
}
