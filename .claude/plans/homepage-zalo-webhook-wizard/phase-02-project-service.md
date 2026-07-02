# Phase 02 — Extract the project-creation service

The Zalo status route (phase 03) must create a project + owner membership the
same way the existing create route does. Extract that into a reusable service
(hard rule 15: general data primitives live in `server/services/`, called by
multiple routes) so membership creation can't diverge.

## Step 1 — New service

### `layers/project/server/services/project.ts`
```ts
import type { CreateProject } from '#layers/project/shared/schemas/project'
import { db } from '@nuxthub/db'
import { projectMemberTable, projectTable } from '@nuxthub/db/schema'
import { eq } from 'drizzle-orm'

export interface CreateProjectInput extends Partial<CreateProject> {
  orgId: string
  userId: string
  name: string
}

/** Insert a project and its owner membership row. Returns the project. */
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

/** Delete a project; project_members cascade via FK. Used to clean up an
 *  orphan project that lost the zalo webhook creation race. */
export async function deleteProject(id: string) {
  await db.delete(projectTable).where(eq(projectTable.id, id))
}
```

## Step 2 — Refactor the existing create route to use it

### `layers/project/server/api/projects/index.post.ts` (replace body)
```ts
import { createError, readValidatedBody } from 'h3'
import { createProject } from '#layers/project/server/services/project'
import { CreateProjectSchema } from '#layers/project/shared/schemas/project'

export default defineAuthorizedHandler(
  ['project:write', 'project:manage'],
  async (event, { session }) => {
    const orgId = session.activeOrg
    if (!orgId)
      throw createError({ statusCode: 400, statusMessage: 'No active organization' })

    const body = await readValidatedBody(event, CreateProjectSchema.parse)

    return createProject({ orgId, userId: session.sub, ...body })
  },
)
```

> Behavior is unchanged: same insert, same owner membership, same return value.

## Done when

- `createProject` / `deleteProject` exported from
  `layers/project/server/services/project.ts`.
- `projects/index.post.ts` delegates to `createProject` and still returns the
  created project.
- `pnpm typecheck` passes; the project layer's existing
  `project-schema` test still passes (`pnpm test`).
