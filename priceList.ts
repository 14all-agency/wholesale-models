import { ObjectId } from 'bson';
import { z } from "zod";
import { OrganisationModel, OrganisationModelSchema, OrganisationResult } from './Organisation';

export const PriceRuleResult = z.object({
  id: z.string().nullable().optional().describe("Each price rule needs a unique ID"),
  context: z.union([
    z.literal("STORE"),
    z.literal("PRODUCT"),
    z.literal("VARIANT"),
    z.literal("COLLECTION"),
  ]).nullable().optional().describe("The type of object this price rule applies to"),
  contextId: z.string().nullable().optional().describe("The applying collection/product id (empty for store)"),
  contextTitle: z.string().nullable().optional().describe("The contextual title"),
  contextImage: z.string().nullable().optional().describe("The contextual image"),
  discountMethod: z.union([
    z.literal("SET_PRICE").describe("A new price or certain price"),
    z.literal("PERCENTAGE").describe("A percentage off the original price"),
    z.literal("FIXED").describe("A fixed amount off the original price"),
  ]).nullable().optional().describe("The type of price/discount"),
  discountAmount: z.number().nullable().optional().describe("The set price value or percentage discount (e.g. 0.3 for 30%)"),
  requiredMinSubtotal: z.number().nullable().optional().describe("The required minimum subtotal amount to activate this discount rule"),
  requiredMinQuantity: z.number().nullable().optional().describe("The required minimum quantity amount to activate this discount rule"),
  requiredMaxSubtotal: z.number().nullable().optional().describe("The required maximum subtotal amount to activate this discount rule"),
  requiredMaxQuantity: z.number().nullable().optional().describe("The required maximum quantity amount to activate this discount rule"),
  requiredConditionsMethod: z.union([
    z.literal("SAME_VARIANT").describe("Requires same variant to meet required subtotal/quantity condition"),
    z.literal("SAME_PRODUCT").describe("Requires same product (any variant) to meet required subtotal/quantity condition"),
    z.literal("SAME_GROUP").describe("Requires products in this discount group (collection, products, etc) to meet  required subtotal/quantity condition"),
    z.literal("SAME_RULE").describe("Requires products in this discount rule (collection, products, etc) to meet  required subtotal/quantity condition"),
    z.literal("ANY").describe("Any product/variant"),
  ]).nullable().optional().describe("Describes how the required subtotal/quantity conditions will be determined"),
});

export type PriceRule = z.infer<typeof PriceRuleResult>;

export const PriceListInputResult = z.object({
  name: z.string().nullable().optional().describe("Admin name for this pricelist"),
  customerTag: z.string().nullable().optional().describe("Tag for this pricelist"),
  priceRules: z.array(PriceRuleResult).nullable().optional(),
  priority: z.number().nullable().optional().describe("The highest priority number is picked first if multiple discounts applicable"),
  enabled: z.boolean().nullable().optional().describe("Whether this price list is enabled or not"),
  markets: z.array(z.string().nullable().optional()).nullable().optional().describe("The enabled markets for this price list, if empty than all are enabled"),
  startDate: z.date().nullable().optional().describe("When this pricelist goes into effect"),
  endDate: z.date().nullable().optional().describe("When this pricelist is no longer in effect"),
  ruleSelectionMethod: z.union([
    z.literal("HIGHEST_DISCOUNT").describe("Pick the rule that will result in the highest discount"),
    z.literal("LOWEST_DISCOUNT").describe("Pick the rule that will result in the lowest discount"),
    z.literal("MOST_SPECIFIC").describe("Pick the rule that is the most specific e.g. Variant => product => collection => store"),
  ]).nullable().optional().describe("Describes what rule will be selected when multiple conflicting rules"),
  calculationMethod: z.union([
    z.literal("REGULAR_PRICE").describe("Use the regular price"),
    z.literal("HIGHEST_PRICE").describe("Use the highest price between regular and compare price"),
  ]).nullable().optional().describe("Describes how percentage or fixed off will be calculated"),
});

export type PriceListInput = z.infer<typeof PriceListInputResult>;

export const PriceListPayloadResult = z.object({
  id: z.string().nullable().optional(),
  ...PriceListInputResult.shape,
});

export type PriceListPayload = z.infer<typeof PriceListPayloadResult>;

export const PriceListResult = z.object({
  _id: z.instanceof(ObjectId),
  org: z.union([
    z.instanceof(ObjectId),
    OrganisationResult,
  ]).describe("The owner of this price list"),
  domain: z.string().nullable().optional().describe("The website domain (for faster access)"),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional().describe("When the settings were last changed"),
  ...PriceListInputResult.shape,
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
  name: PriceListResult.shape.name,
  customerTag: PriceListResult.shape.customerTag,
  priceRules: PriceListResult.shape.priceRules,
  priority: PriceListResult.shape.priority,
  enabled: PriceListResult.shape.enabled,
  markets: PriceListResult.shape.markets,
  startDate: PriceListResult.shape.startDate,
  endDate: PriceListResult.shape.endDate,
  ruleSelectionMethod: PriceListResult.shape.ruleSelectionMethod,
  calculationMethod: PriceListResult.shape.calculationMethod,
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
      name: entity.name || "",
      customerTag: entity.customerTag || "",
      priceRules: entity.priceRules || [],
      priority: entity.priority || 0,
      enabled: entity.enabled || false,
      markets: entity.markets || [],
      startDate: entity.startDate ? new Date(entity.startDate) : null,
      endDate: entity.endDate ? new Date(entity.endDate) : null,
      ruleSelectionMethod: entity.ruleSelectionMethod || "HIGHEST_DISCOUNT",
      calculationMethod: entity.calculationMethod || "REGULAR_PRICE",
    };
    return PriceListModelSchema.parse(obj);
  },
};