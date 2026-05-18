export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Restaurant Management API",
    version: "1.0.0",
    description: "REST API for the Restaurant Management application"
  },
  servers: [{ url: "http://localhost:3000" }],
  tags: [
    { name: "Tasks", description: "Task CRUD operations" },
    { name: "Menu", description: "Menu catalog" },
    { name: "Orders", description: "Order placement and tracking" },
    { name: "Manager", description: "Manager authentication and order management" }
  ],
  paths: {
    "/api": {
      get: {
        summary: "API health check",
        responses: {
          "200": {
            description: "API is running",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    message: { type: "string", example: "Restaurant API is running" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "Get all tasks",
        responses: {
          "200": {
            description: "List of tasks",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Task" }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a new task",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", example: "Call supplier" },
                  completed: { type: "boolean", example: false }
                }
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Task created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Task" }
              }
            }
          },
          "400": { description: "Validation error" }
        }
      }
    },
    "/api/tasks/{id}": {
      put: {
        tags: ["Tasks"],
        summary: "Update a task",
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string" } }
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  completed: { type: "boolean" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Updated task", content: { "application/json": { schema: { $ref: "#/components/schemas/Task" } } } },
          "404": { description: "Task not found" }
        }
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete a task",
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string" } }
        ],
        responses: {
          "200": { description: "Deleted task", content: { "application/json": { schema: { $ref: "#/components/schemas/Task" } } } },
          "404": { description: "Task not found" }
        }
      }
    },
    "/api/menu": {
      get: {
        tags: ["Menu"],
        summary: "Get menu grouped by cuisine",
        responses: {
          "200": {
            description: "Menu catalog",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: {
                    type: "array",
                    items: { $ref: "#/components/schemas/MenuItem" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/orders": {
      post: {
        tags: ["Orders"],
        summary: "Place a new order",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["address", "items"],
                properties: {
                  address: { $ref: "#/components/schemas/DeliveryAddress" },
                  items: {
                    type: "array",
                    items: { $ref: "#/components/schemas/CartItemInput" }
                  }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Order created", content: { "application/json": { schema: { $ref: "#/components/schemas/Order" } } } },
          "400": { description: "Validation error" }
        }
      }
    },
    "/api/orders/{orderId}": {
      get: {
        tags: ["Orders"],
        summary: "Track an order by ID",
        parameters: [
          { in: "path", name: "orderId", required: true, schema: { type: "string" }, example: "12345" }
        ],
        responses: {
          "200": { description: "Order details", content: { "application/json": { schema: { $ref: "#/components/schemas/Order" } } } },
          "404": { description: "Order not found" }
        }
      }
    },
    "/api/manager/login": {
      post: {
        tags: ["Manager"],
        summary: "Manager login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string", example: "Admin" },
                  password: { type: "string", example: "Admin" }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Login successful" },
          "401": { description: "Invalid credentials" }
        }
      }
    },
    "/api/manager/session": {
      get: {
        tags: ["Manager"],
        summary: "Check manager session status",
        responses: {
          "200": {
            description: "Session status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { active: { type: "boolean" } }
                }
              }
            }
          }
        }
      }
    },
    "/api/manager/logout": {
      post: {
        tags: ["Manager"],
        summary: "Manager logout",
        responses: {
          "200": { description: "Logged out" }
        }
      }
    },
    "/api/manager/orders": {
      get: {
        tags: ["Manager"],
        summary: "List all orders (requires manager login)",
        responses: {
          "200": { description: "All orders", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Order" } } } } },
          "401": { description: "Unauthorized" }
        }
      }
    }
  },
  components: {
    schemas: {
      Task: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          completed: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      MenuItem: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          cuisine: { type: "string" },
          price: { type: "number" }
        }
      },
      DeliveryAddress: {
        type: "object",
        required: ["flatHomeDetails", "area", "landmark", "pinCode", "city", "state"],
        properties: {
          flatHomeDetails: { type: "string", example: "221B MG Road" },
          area: { type: "string", example: "Indiranagar" },
          landmark: { type: "string", example: "Near Metro" },
          pinCode: { type: "string", example: "560038" },
          city: { type: "string", example: "Bengaluru" },
          state: { type: "string", example: "Karnataka" }
        }
      },
      CartItemInput: {
        type: "object",
        required: ["itemId", "quantity"],
        properties: {
          itemId: { type: "string", example: "ni-1" },
          quantity: { type: "integer", example: 2 }
        }
      },
      OrderItem: {
        type: "object",
        properties: {
          itemId: { type: "string" },
          name: { type: "string" },
          price: { type: "number" },
          quantity: { type: "integer" },
          lineTotal: { type: "number" }
        }
      },
      Order: {
        type: "object",
        properties: {
          orderId: { type: "string" },
          address: { $ref: "#/components/schemas/DeliveryAddress" },
          items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
          totalPrice: { type: "number" },
          status: { type: "string", enum: ["In process", "Delivered"] },
          createdAt: { type: "string", format: "date-time" }
        }
      }
    }
  }
};
