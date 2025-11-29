import { ObjectId } from 'bson';
import { z } from "zod";
import { OrganisationModel, OrganisationModelSchema, OrganisationResult } from './Organisation';

export const SubtotalDiscountRuleResult = z.object({
  id: z.string().nullable().optional().describe("A unique ID used for just managing rules"),
  requiredSubtotal: z.number().nullable().optional().describe("The required subtotal amount to activate this discount rule"),
  discountMethod: z.union([
    z.literal("FIXED"),
    z.literal("PERCENTAGE"),
  ]).describe("The type of price/discount"),
  discountAmount: z.number().nullable().optional().describe("The fixed price or percentage discount (e.g. 0.3 for 30%)")
});

export type SubtotalDiscountRule = z.infer<typeof SubtotalDiscountRuleResult>;

export const SubtotalDiscountGroupInputResult = z.object({
  name: z.string().nullable().optional().describe("Admin name for this resource"),
  customerTag: z.string().nullable().optional().describe("Tag for this resource"),
  priceRules: z.array(SubtotalDiscountRuleResult).nullable().optional(),
  priority: z.number().nullable().optional().describe("The highest priority number is picked first if multiple discounts applicable"),
  enabled: z.boolean().nullable().optional().describe("Whether this resource is enabled or not"),
});

export type SubtotalDiscountGroupInput = z.infer<typeof SubtotalDiscountGroupInputResult>;

export const SubtotalDiscountGroupPayloadResult = z.object({
  id: z.string().nullable().optional(),
  ...SubtotalDiscountGroupInputResult.shape,
});

export type SubtotalDiscountGroupPayload = z.infer<typeof SubtotalDiscountGroupPayloadResult>;

export const SubtotalDiscountGroupResult = z.object({
  _id: z.instanceof(ObjectId),
  org: z.union([
    z.instanceof(ObjectId),
    OrganisationResult,
  ]).describe("The owner of this subtotal discount group"),
  domain: z.string().nullable().optional().describe("The website domain (for faster access)"),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional().describe("When the settings were last changed"),
  ...SubtotalDiscountGroupInputResult.shape,
});

export type SubtotalDiscountGroupResultEntity = z.infer<typeof SubtotalDiscountGroupResult>;

export const SubtotalDiscountGroupModelSchema = z.object({
  id: z.string(),
  org: z.union([
    z.string(),
    OrganisationModelSchema,
  ]),
  domain: SubtotalDiscountGroupResult.shape.domain,
  createdAt: SubtotalDiscountGroupResult.shape.createdAt,
  updatedAt: SubtotalDiscountGroupResult.shape.updatedAt,
  name: SubtotalDiscountGroupResult.shape.name,
  customerTag: SubtotalDiscountGroupResult.shape.customerTag,
  priceRules: SubtotalDiscountGroupResult.shape.priceRules,
  priority: SubtotalDiscountGroupResult.shape.priority,
  enabled: SubtotalDiscountGroupResult.shape.enabled,
});

export type SubtotalDiscountGroupModel = z.infer<typeof SubtotalDiscountGroupModelSchema>;

export const SubtotalDiscountGroupModel = {
  convertFromEntity(entity: SubtotalDiscountGroupResultEntity): SubtotalDiscountGroupModel {
    const obj: SubtotalDiscountGroupModel = {
      id: entity._id.toHexString(),
      // @ts-ignore
      org: ObjectId.isValid(entity.org) ? entity.org.toHexString() : OrganisationModel.convertFromEntity(entity.org, includeCredentials),
      domain: entity.domain || "",
      ...entity.createdAt && { createdAt: new Date(entity.createdAt || new Date()) },
      ...entity.updatedAt && { updatedAt: new Date(entity.updatedAt || new Date()) },
      name: entity.name || "",
      customerTag: entity.customerTag || "",
      priceRules: entity.priceRules || [],
      priority: entity.priority || 0,
      enabled: entity.enabled || false,
    };
    return SubtotalDiscountGroupModelSchema.parse(obj);
  },
};