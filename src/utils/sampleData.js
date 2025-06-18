// src/utils/sampleData.js

export const SAMPLE_SCHEMAS = {
  old: {
    UserSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        email: { type: "string", format: "email" },
        name: { type: "string" },
        age: { type: "integer" },
        status: { type: "string", enum: ["active", "inactive"] }
      },
      required: ["id", "email", "name"]
    },
    OrderSchema: {
      type: "object",
      properties: {
        orderId: { type: "string" },
        userId: { type: "string" },
        total: { type: "number" },
        status: { type: "string", enum: ["pending", "confirmed", "shipped"] }
      },
      required: ["orderId", "userId", "total"]
    }
  },
  new: {
    UserSchema: {
      type: "object", 
      properties: {
        id: { type: "string" },
        emailAddress: { type: "string", format: "email" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        birthDate: { type: "string", format: "date" },
        accountStatus: { type: "string", enum: ["active", "inactive", "suspended"] },
        phoneNumber: { type: "string" }
      },
      required: ["id", "emailAddress", "firstName", "lastName"]
    },
    OrderSchema: {
      type: "object",
      properties: {
        orderId: { type: "string" },
        customerId: { type: "string" },
        subtotal: { type: "number" },
        tax: { type: "number" },
        total: { type: "number" },
        orderStatus: { type: "string", enum: ["pending", "confirmed", "shipped", "delivered"] },
        shippingAddress: {
          type: "object",
          properties: {
            street: { type: "string" },
            city: { type: "string" }
          },
          required: ["street", "city"]
        }
      },
      required: ["orderId", "customerId", "subtotal", "tax", "total", "shippingAddress"]
    }
  }
};

export const SAMPLE_SERVICES = [
  {
    name: "user-service",
    importance: "HIGH",
    callsPerDay: 25000,
    // Keep old structure for compatibility with existing schema analyzer
    dependencies: [
      "UserSchema.id",
      "UserSchema.email",
      "UserSchema.name"
    ],
    // Add new structure for deployment optimizer
    serviceDependencies: [],
    isCore: true
  },
  {
    name: "auth-service", 
    importance: "CRITICAL",
    callsPerDay: 40000,
    dependencies: [
      "UserSchema.email",
      "UserSchema.status"
    ],
    serviceDependencies: ["user-service"],
    isCore: true
  },
  {
    name: "notification-service",
    importance: "HIGH",
    callsPerDay: 15000,
    dependencies: [
      "UserSchema.email",
      "UserSchema.name"
    ],
    serviceDependencies: ["user-service"],
    isCore: false
  },
  {
    name: "order-service",
    importance: "CRITICAL", 
    callsPerDay: 30000,
    dependencies: [
      "OrderSchema.orderId",
      "OrderSchema.userId",
      "OrderSchema.total",
      "OrderSchema.status"
    ],
    serviceDependencies: ["user-service"],
    isCore: true
  },
  {
    name: "payment-service",
    importance: "CRITICAL",
    callsPerDay: 20000,
    dependencies: [
      "OrderSchema.total",
      "UserSchema.id"
    ],
    serviceDependencies: ["user-service", "order-service"],
    isCore: true
  },
  {
    name: "analytics-service",
    importance: "MEDIUM",
    callsPerDay: 8000,
    dependencies: [
      "UserSchema.age",
      "OrderSchema.total"
    ],
    serviceDependencies: ["user-service"],
    isCore: false
  },
  {
    name: "reporting-service",
    importance: "LOW",
    callsPerDay: 3000,
    dependencies: [
      "UserSchema.id",
      "OrderSchema.orderId"
    ],
    serviceDependencies: ["user-service", "order-service"],
    isCore: false
  },
  {
    name: "search-service",
    importance: "MEDIUM",
    callsPerDay: 12000,
    dependencies: [
      "UserSchema.id"
    ],
    serviceDependencies: ["user-service"],
    isCore: false
  }
];