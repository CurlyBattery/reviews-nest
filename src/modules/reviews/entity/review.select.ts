import { type Prisma } from '../../../../generated/prisma';

export const ReviewsSelect = {
  id: true,
  title: true,
  previewId: true,
  category: true,
  text: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ReviewSelect;

export type Reviews = Prisma.ReviewGetPayload<{ select: typeof ReviewsSelect }>;
