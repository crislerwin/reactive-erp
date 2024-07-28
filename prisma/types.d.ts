declare global {
  namespace Prisma.JsonValue {
    type Items = { product_id: string; quantity: string }[];
  }
}
