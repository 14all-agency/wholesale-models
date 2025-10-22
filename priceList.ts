import { ObjectId } from 'bson';
import { z } from "zod";
import { OrganisationModel, OrganisationModelSchema, OrganisationResult } from './Organisation';

export const PriceRuleResult = z.object({
  context: z.union([
    z.literal("STORE"),
    z.literal("PRODUCT"),
    z.literal("VARIANT"),
    z.literal("COLLECTION"),
  ]).describe("The type of object this price rule applies to"),
  contextId: z.string().nullable().optional().describe("The applying collection/product id (empty for store)"),
  contextTitle: z.string().nullable().optional().describe("The contextual title"),
  contextImage: z.string().nullable().optional().describe("The contextual image"),
  discountMethod: z.union([
    z.literal("SET_PRICE"),
    z.literal("PERCENTAGE"),
  ]).describe("The type of price/discount"),
  discountAmount: z.number().nullable().optional().describe("The set price value or percentage discount (e.g. 0.3 for 30%)")
});

export type PriceRule = z.infer<typeof PriceRuleResult>;

export const PriceListResult = z.object({
  _id: z.instanceof(ObjectId),
  org: z.union([
    z.instanceof(ObjectId),
    OrganisationResult,
  ]).describe("The owner of this price list"),
  domain: z.string().nullable().optional().describe("The website domain (for faster access)"),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional().describe("When the settings were last changed"),
  customerTag: z.string().nullable().optional().describe("Tag for this pricelist"),
  priceRules: z.array(PriceRuleResult).nullable().optional(),
  priority: z.number().nullable().optional().describe("The highest priority number is picked first if multiple discounts applicable"),
  enabled: z.boolean().nullable().optional().describe("Whether this price list is enabled or not"),
});

export type PriceListResultEntity = z.infer<typeof PriceListResult>;

export const PriceListModelSchema = z.object({
  id: z.string(),
  org: z.union([
    z.string(),
    OrganisationModelSchema,
  ]),
  domain: PriceListResult.shape.domain,
  createdAt: PriceListResult.shape.createdAt,
  updatedAt: PriceListResult.shape.updatedAt,
  customerTag: PriceListResult.shape.customerTag,
  priceRules: PriceListResult.shape.priceRules,
  priority: PriceListResult.shape.priority,
  enabled: PriceListResult.shape.enabled,
});

export type PriceListModel = z.infer<typeof PriceListModelSchema>;

export const PriceListModel = {
  convertFromEntity(entity: PriceListResultEntity): PriceListModel {
    const obj: PriceListModel = {
      id: entity._id.toHexString(),
      // @ts-ignore
      org: ObjectId.isValid(entity.org) ? entity.org.toHexString() : OrganisationModel.convertFromEntity(entity.org, includeCredentials),
      domain: entity.domain || "",
      ...entity.createdAt && { createdAt: new Date(entity.createdAt || new Date()) },
      ...entity.updatedAt && { updatedAt: new Date(entity.updatedAt || new Date()) },
      customerTag: entity.customerTag || "",
      priceRules: entity.priceRules || [],
      priority: entity.priority || 0,
      enabled: entity.enabled || false,
    };
    return PriceListModelSchema.parse(obj);
  },
};