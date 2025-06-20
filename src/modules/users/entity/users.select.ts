import { type Prisma } from '../../../../generated/prisma';

export const UsersSelect = {
  id: true,
  email: true,
  username: true,
  avatarId: true,
} satisfies Prisma.UserSelect;

export type Users = Prisma.UserGetPayload<{ select: typeof UsersSelect }>;
