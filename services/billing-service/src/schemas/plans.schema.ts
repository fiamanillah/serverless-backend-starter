import { z } from 'zod';

export const createPlanSchema = z
    .object({
        name: z.string().min(2),
        billingType: z.enum(['subscription', 'payg']),
        monthlyPrice: z.number().nonnegative().optional(),
        platformFee: z.number().nonnegative().optional(),
        annualPrice: z.number().nonnegative().optional(),
        includedBookings: z.number().int().nonnegative().optional(),
        currency: z.string().min(3).max(3).default('GBP'),
        description: z.string().optional(),
        unitLabel: z.string().optional(),
        isActive: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.billingType === 'payg' && typeof data.platformFee !== 'number') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['platformFee'],
                message: 'platformFee is required for payg plans',
            });
        }

        if (data.billingType === 'subscription' && typeof data.monthlyPrice !== 'number') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['monthlyPrice'],
                message: 'monthlyPrice is required for subscription plans',
            });
        }
    });

export const updatePlanSchema = z.object({
    name: z.string().min(2).optional(),
    monthlyPrice: z.number().nonnegative().optional(),
    platformFee: z.number().nonnegative().optional(),
    annualPrice: z.number().nonnegative().optional(),
    includedBookings: z.number().int().nonnegative().optional(),
    currency: z.string().min(3).max(3).optional(),
    description: z.string().optional(),
    unitLabel: z.string().optional(),
    isActive: z.boolean().optional(),
});
