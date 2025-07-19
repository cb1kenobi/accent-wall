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

  if (!data.name) {
    throw new Error('Name is required');
  }

  if (typeof data.name !== 'string') {
    throw new Error('Name must be a string');
  }

  if (data.name.length > 255) {
    throw new Error('Name must be less than 255 characters');
  }

  if (typeof data.boardWidth !== 'number') {
    throw new Error('Board width must be a number');
  }

  if (typeof data.height !== 'number') {
    throw new Error('Height must be a number');
  }

  if (typeof data.rows !== 'number') {
    throw new Error('Rows must be a number');
  }

  if (data.seed !== undefined && typeof data.seed !== 'number') {
    throw new Error('Seed must be a number');
  }

  if (typeof data.spacing !== 'number') {
    throw new Error('Spacing must be a number');
  }

  if (typeof data.width !== 'number') {
    throw new Error('Width must be a number');
  }

  if (!Array.isArray(data.columns)) {
    throw new Error('Columns must be an array');
  }

  for (const column of data.columns) {
    if (!column) {
      throw new Error('Column must be an object');
    }

    if (column.index === undefined || typeof column.index !== 'number') {
      throw new Error('Column index must be a number');
    }

    if (!Array.isArray(column.tiles) || !column.tiles.every(tile => typeof tile === 'string')) {
      throw new Error('Column tiles must be an array of strings');
    }

    if (!Array.isArray(column.segments) || !column.segments.every(segment => {
      if (!segment) {
        return false;
      }

      if (segment.type !== 'board' && segment.type !== 'space') {
        return false;
      }

      if (typeof segment.length !== 'number') {
        return false;
      }

      if (segment.start !== undefined && segment.start !== 'left' && segment.start !== 'right') {
        return false;
      }

      if (segment.end !== undefined && segment.end !== 'left' && segment.end !== 'right') {
        return false;
      }

      return true;
    })) {
      throw new Error('Column segments must be an array of objects');
    }
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
