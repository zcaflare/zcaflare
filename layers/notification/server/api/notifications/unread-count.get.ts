import { db } from '@nuxthub/db'
import { notificationTable } from '@nuxthub/db/schema'
import { and, count, eq } from 'drizzle-orm'

// The return type is annotated, not inferred. Inferring it drags drizzle's
// query-builder generics through `Serialize<Awaited<ReturnType<…>>>` in the
// generated route types, which TypeScript gives up on (TS2589) at the call site
// in useNotificationApi.
export default defineAuthenticatedHandler(async (event, session): Promise<{ count: number }> => {
  const orgId = event.context.activeOrganizationId
  if (!orgId)
    return { count: 0 }
  const [row] = await db
    .select({ count: count() })
    .from(notificationTable)
    .where(and(
      eq(notificationTable.user_id, session.sub),
      eq(notificationTable.organization_id, orgId),
      eq(notificationTable.is_read, false),
    ))
  return { count: row?.count ?? 0 }
})
