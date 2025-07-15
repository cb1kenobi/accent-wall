'use server';

import { auth } from '@/lib/auth';
import { designsTable } from '@/db/schema';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { Column } from '@/app/lib/get-column';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

interface Design {
  boardWidth: number;
  columns: Column[];
  designId?: string;
  height: number;
  name: string;
  rows: number;
  seed?: number;
  spacing: number;
  width: number;
}

export async function saveDesignAction(data: Design) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  if (data.designId) {
    await db.update(designsTable).set({
      name: data.name,
      data: {
        boardWidth: data.boardWidth,
        columns: data.columns,
        height: data.height,
        rows: data.rows,
        seed: data.seed,
        spacing: data.spacing,
        width: data.width,
      },
      updatedAt: new Date(),
    }).where(
      and(
        eq(designsTable.designId, data.designId),
        eq(designsTable.email, session.user.email)
      )
    );

    return data.designId;
  }

  const result = await db.insert(designsTable).values({
    email: session.user.email,
    name: data.name,
    data: {
      boardWidth: data.boardWidth,
      columns: data.columns,
      height: data.height,
      rows: data.rows,
      seed: data.seed,
      spacing: data.spacing,
      width: data.width,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({ designId: designsTable.designId });

  revalidatePath('/');
  return result[0].designId;
}

export async function getDesignsAction() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  return await db
    .select({
      designId: designsTable.designId,
      name: designsTable.name,
      createdAt: designsTable.createdAt,
      updatedAt: designsTable.updatedAt,
    })
    .from(designsTable)
    .where(eq(designsTable.email, session.user.email));
}

export async function loadDesignAction(designId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  const design = await db
    .select({
      designId: designsTable.designId,
      name: designsTable.name,
      data: designsTable.data,
      createdAt: designsTable.createdAt,
      updatedAt: designsTable.updatedAt,
    })
    .from(designsTable)
    .where(and(eq(designsTable.designId, designId), eq(designsTable.email, session.user.email)))
    .limit(1);

  if (!design.length) {
    throw new Error('Design not found');
  }

  const {
    name,
    data,
    createdAt,
    updatedAt,
  } = design[0] as {
    name: string;
    data: {
      boardWidth: number;
      columns: Column[];
      height: number;
      rows: number;
      seed: number;
      spacing: number;
      width: number;
    };
    createdAt: Date;
    updatedAt: Date;
  };

  return {
    designId,
    name,
    ...data,
    createdAt,
    updatedAt,
  };
}

export async function deleteDesignAction(designId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  await db.delete(designsTable).where(
    and(
      eq(designsTable.designId, designId),
      eq(designsTable.email, session.user.email)
    )
  );

  revalidatePath('/');
}
