import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export function getTenantPrisma(tenantId: string) {
  return prisma.$extends({
    name: 'tenant-isolation',
    query: {
      project: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async create({ args, query }) {
          args.data = { ...(args.data as object), tenantId } as any;
          return query(args);
        },
        async count({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
      },

      user: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async create({ args, query }) {
          args.data = { ...(args.data as object), tenantId } as any;
          return query(args);
        },
        async count({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
      },

      task: {
        async findMany({ args, query }) {
          const currentProject = (args.where as any)?.project || {};
          args.where = {
            ...args.where,
            project: { ...currentProject, tenantId },
          } as any;
          return query(args);
        },
        async findFirst({ args, query }) {
          const currentProject = (args.where as any)?.project || {};
          args.where = {
            ...args.where,
            project: { ...currentProject, tenantId },
          } as any;
          return query(args);
        },
        async count({ args, query }) {
          const currentProject = (args.where as any)?.project || {};
          args.where = {
            ...args.where,
            project: { ...currentProject, tenantId },
          } as any;
          return query(args);
        },
      },
    },
  });
}