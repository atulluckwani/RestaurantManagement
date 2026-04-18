# Frontend Functionality Document - Restaurant Management System
**Document Version:** 1.0  
**Last Updated:** April 2026  
**Purpose:** User Story Creation & Product Owner Reference

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Feature Map](#feature-map)
3. [User Stories by Feature](#user-stories-by-feature)
4. [Data Models & Structures](#data-models--structures)
5. [Navigation & Entry Points](#navigation--entry-points)
6. [Integration Points (APIs)](#integration-points-apis)
7. [Error Handling & Validation Rules](#error-handling--validation-rules)
8. [Browser Storage & Session Management](#browser-storage--session-management)

---

## System Overview

### Application Name
**Restaurant Management System** - A web-based application for customers to browse restaurant menus, place orders, and track delivery. Includes a manager dashboard for order management.

### Target Users
- **Customers:** Browse menu, manage shopping cart, place orders, track orders
- **Managers:** Authenticate and view all customer orders

### Technology Stack (Frontend)
- HTML5
- Vanilla JavaScript (ES6+)
- CSS3
- Browser LocalStorage (client-side data persistence)

### Core Features
1. **Menu Browsing** - View restaurant items categorized by cuisine
2. **Shopping Cart Management** - Add/remove items, manage quantities
3. **Order Placement** - Enter delivery address and submit order
4. **Order Tracking** - Look up order status by Order ID
5. **Manager Dashboard** - Authenticate and view all orders

---

## Feature Map

| Page | URL | Feature | User Type | Prerequisites |
|------|-----|---------|-----------|---------------|
| Landing | `/` | Auto-redirect to menu | All | None |
| Menu | `/menu.html` | Browse menu items, add to cart | Customer | None |
| Shopping Cart | `/cart.html` | View cart, delete items, place order | Customer | Items in cart |
| Order Tracking | `/orders.html` | Search and track order | Customer | Placed order |
| Manager Dashboard | `/manager.html` | Login, view all orders | Manager | Valid credentials |

---

## User Stories by Feature

### 1. MENU BROWSING FEATURE

#### Story 1.1: View Restaurant Menu
**As a** customer  
**I want to** see all available menu items organized by cuisine type  
**So that** I can browse and decide what to order  

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| **Menu Display** | Menu item displayed with: Item Name, Cuisine Category, Price in Indian Rupees (₹) |
| **Categories** | Items grouped into 3 cuisine categories: North Indian, South Indian, Chinese |
| **Item Count** | Total 15 menu items available across all categories |
| **Price Format** | Prices displayed in format: "₹ XXX" |
| **Load Time** | API `/api/menu` called on page load |
| **Fallback** | If API fails, hardcoded menu displayed with message showing fallback status |
| **Visual Feedback** | Users see "Redirecting to menu..." on index.html before landing on menu.html |

**Data to Display:**
- North Indian (5 items): Butter Chicken (₹320), Paneer Tikka (₹260), Dal Makhani (₹220), Naan Basket (₹140), Chole Bhature (₹200)
- South Indian (5 items): Masala Dosa (₹180), Idli Sambar (₹140), Medu Vada (₹150), Lemon Rice (₹170), Curd Rice (₹130)
- Chinese (5 items): Veg Hakka Noodles (₹210), Chilli Paneer (₹250), Schezwan Fried Rice (₹230), Spring Rolls (₹190), Manchurian Gravy (₹240)

---

#### Story 1.2: Add Items to Shopping Cart
**As a** customer  
**I want to** add menu items to my shopping cart  
**So that** I can prepare my order  

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| **Add Button** | Each menu item has an "Add to cart" button |
| **Single Item Add** | Clicking adds item with quantity 1 to cart |
| **Duplicate Items** | If item already in cart, quantity increments by 1 (not duplicate entry) |
| **Success Message** | After adding: "{Item Name} added to cart. Open Cart page to continue." |
| **Cart Persistence** | Cart stored in localStorage with key `restaurant_cart_v1` |
| **Cart Structure** | Each entry: `{ itemId, name, price, quantity }` |
| **No Page Navigation** | User stays on Menu page after adding item |
| **Navigation Counter Update** | "Cart (N)" counter updates immediately showing total items in cart |
| **Error Handling** | If localStorage unavailable, show error and fallback to in-memory storage |
| **Multiple Items** | User can add multiple different items in one session |

---

#### Story 1.3: View Cart Item Count in Navigation
**As a** customer  
**I want to** see how many items are in my cart from any page  
**So that** I know my cart status without navigating  

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| **Navigation Bar** | "Cart (N)" displayed in navigation menu on all pages |
| **Real-time Updates** | Counter updates immediately when items added/removed |
| **Count Calculation** | N = sum of quantities of all items in cart |
| **Empty Cart** | Shows "Cart (0)" when no items |
| **Persistence** | Maintains count across page refreshes |
| **Page Availability** | Navigation present on: Menu, Cart, Orders, Manager pages |
| **Clickable Link** | "Cart" text/counter is clickable and navigates to `/cart.html` |

---

### 2. SHOPPING CART FEATURE

#### Story 2.1: View Items in Shopping Cart
**As a** customer  
**I want to** view all items I've added to my cart with quantities and prices  
**So that** I can review what I'm ordering before checkout  

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| **Cart Items Display** | Each item shows: Name, Quantity, Unit Price (₹), Line Total (₹) |
| **Item Format** | Line Total = Quantity × Unit Price |
| **Currency Format** | Prices formatted as Indian currency (e.g., "₹1,20,000") |
| **Empty State** | If cart empty, show "No items in cart yet." message |
| **Empty Cart Total** | If empty, total shows "₹0" or hidden |
| **Cart Total** | Sum of all line totals displayed at bottom |
| **Cart Retrieval** | Cart loaded from localStorage on page load |
| **Data Accuracy** | Displays persisted cart data correctly |
| **No Edit Inline** | Quantities not editable on this page (delete and re-add) |

---

#### Story 2.2: Remove Items from Cart
**As a** customer  
**I want to** remove unwanted items from my cart  
**So that** I can adjust my order  

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| **Delete Button** | Each cart item has a "Delete" button |
| **Item Removal** | Clicking delete removes item completely from cart |
| **Cart Update** | Cart saved to localStorage after deletion |
| **Navigation Counter** | "Cart (N)" counter updates immediately |
| **UI Re-render** | Cart display updates without page reload |
| **Confirmation** | No delete confirmation dialog required |
| **Multiple Deletions** | User can delete multiple items sequentially |
| **All Deleted State** | If all items deleted, show empty cart message |

---

#### Story 2.3: Proceed to Billing/Address Entry
**As a** customer  
**I want to** enter my delivery address for order fulfillment  
**So that** the restaurant knows where to deliver my order  

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| **Billing Form Trigger** | "Proceed to billing" button visible when cart has items |
| **Form Visibility** | Clicking button shows billing form (toggle behavior) |
| **Form Location** | Form appears below cart items |
| **Empty Cart Error** | If cart empty, clicking button shows: "Add at least one item before billing." |
| **Form Fields** | Form contains: Flat/Home Details, Area, Landmark, Pin Code, City, State |
| **All Fields Required** | All 6 fields mandatory for order submission |
| **State Dropdown** | State field is dropdown with 28 Indian states |
| **Pin Code Field** | Numeric input field |
| **Pin Code Length** | Must accept exactly 6 digits |
| **Form Persistence** | Form fields not pre-filled; user enters fresh each order |
| **Multiple Toggles** | User can toggle form visibility on/off multiple times |

---

#### Story 2.4: Place Order with Delivery Address
**As a** customer  
**I want to** submit my order with delivery address  
**So that** the restaurant can process and deliver my order  

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| **Form Submission** | "Submit" or "Place Order" button submits address + cart items |
| **API Endpoint** | POST request to `/api/orders` |
| **Request Payload** | `{ "address": { flatHomeDetails, area, landmark, pinCode, city, state }, "items": [{ itemId, quantity }, ...] }` |
| **Field Validation** | All fields required; no submission if any field empty |
| **Pin Code Validation** | Pin code must be exactly 6 digits; reject if length != 6 |
| **Success Response** | Server returns order object with: orderId, status (initial), address, totalPrice |
| **Success Message** | Display: "Order placed. Your Order ID is {ID}. Current status: {status}" |
| **Order ID Format** | 5-digit numeric order ID |
| **Cart Clearing** | Cart cleared from localStorage after successful order |
| **Form Reset** | Billing form cleared and hidden after success |
| **Cart Clear UI** | Cart items cleared from display after success |
| **Error Display** | If submission fails, show server error message to user |
| **Status Codes** | Handle both success (2xx) and error responses (4xx, 5xx) |
| **Duplicate Prevention** | Button disabled during submission to prevent double-click orders |

**State Dropdown Options:**
Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Goa, Gujarat, Haryana, Himachal Pradesh, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal

---

### 3. ORDER TRACKING FEATURE

#### Story 3.1: Search and Track Order by Order ID
**As a** customer  
**I want to** track my order status by entering my order ID  
**So that** I can know when it will be delivered  

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| **Input Field** | Text input field with placeholder "Enter 5-digit order id" |
| **Track Button** | "Track" button to submit order ID search |
| **API Endpoint** | GET request to `/api/orders/{orderId}` |
| **URL Encoding** | Order ID properly URL-encoded in request |
| **Success Response** | Returns: orderId, status, totalPrice, address |
| **Display Results** | On success show: Order ID, Status, Total Price, Formatted Address |
| **Price Format** | Total price formatted as Indian currency (e.g., "₹1,25,000") |
| **Address Format** | Address formatted as: "FlatHomeDetails, Area, Landmark, City - PinCode, State" |
| **Address Formatting** | Comma-separated address from component fields |
| **Empty Input Error** | If field empty on Track click, show: "Please enter an order id." |
| **Invalid ID Error** | If order not found, show: "Order not found" |
| **Status Possible Values** | Order status can be: pending, confirmed, preparing, out_for_delivery, delivered |
| **Clear Display** | Previous search results cleared when new search performed |
| **Case Sensitivity** | Order ID input case-insensitive if applicable |

---

### 4. MANAGER AUTHENTICATION & DASHBOARD

#### Story 4.1: Manager Login Authentication
**As a** manager  
**I want to** login with my credentials to access order management  
**So that** I can view and manage customer orders  

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| **Login Form** | Username and password input fields visible on Manager page |
| **Form Fields** | Username: text input, Password: masked input |
| **Login Button** | "Login" button to submit credentials |
| **API Endpoint** | POST request to `/api/manager/login` |
| **Request Payload** | `{ "username": string, "password": string }` |
| **Session Credentials** | Request sent with `credentials: "include"` for session cookies |
| **Success Response** | Valid credentials accepted, session cookie set |
| **Success Message** | Display: "Manager login successful" |
| **Failure Message** | Invalid credentials show: "Invalid credentials." |
| **Post-Login** | Orders table becomes visible after successful login |
| **Login Form Hide** | Form hidden (or grayed) once successfully logged in |
| **Session Persistence** | Session maintained via server-side cookies |
| **No Token Handling** | Authentication via session cookies, not JWT or bearer tokens |

---

#### Story 4.2: View All Orders in Manager Dashboard
**As a** manager  
**I want to** view a table of all customer orders with details  
**So that** I can manage and monitor order fulfillment  

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| **Orders Table** | Table displays all orders with columns: Order ID, Address, Items, Total, Status, Placed At |
| **Visibility Gate** | Table only visible after successful manager login |
| **API Endpoint** | GET request to `/api/manager/orders` |
| **Session Requirement** | Request includes session cookie from login |
| **Post-Login Auto-Load** | Orders fetched and displayed immediately after login |
| **Order ID Column** | System-generated 5-digit numeric ID |
| **Address Column** | Formatted delivery address from order |
| **Items Column** | Format: "Item Name x Quantity, Item2 x Qty2, ..." |
| **Total Column** | Order total in Indian currency format (₹X,XX,XXX) |
| **Status Column** | Current order status: pending, confirmed, preparing, out_for_delivery, delivered |
| **Placed At Column** | Timestamp formatted in local date/time format |
| **Table Structure** | Standard HTML table with proper headers and rows |
| **Row Count** | All orders displayed, no pagination limit in current version |
| **Read-Only Display** | Table is for viewing only, no inline editing |
| **Session Expiry** | If session expired, "Unauthorized" error shown |
| **Empty State** | If no orders exist, show "No orders available" message |

---

#### Story 4.3: Refresh Orders List
**As a** manager  
**I want to** refresh the orders list to see real-time updates  
**So that** I can monitor order progress without logging out  

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| **Refresh Button** | "Refresh orders" button visible on dashboard (near table) |
| **Refresh Action** | Clicking button re-fetches orders from `/api/manager/orders` |
| **No Re-authentication** | Refresh uses same session cookie; no need to login again |
| **Table Update** | Orders table updates with latest data from server |
| **Session Check** | If session expired during refresh, shows "Unauthorized" or session expiry error |
| **Error Message** | If refresh fails, displays server error; table not cleared |
| **User Feedback** | Optional: Loading indicator during refresh for UX |
| **Multiple Refreshes** | User can refresh multiple times in same session |

---

#### Story 4.4: Manager Logout
**As a** manager  
**I want to** logout from the system  
**So that** my session is securely closed  

**Acceptance Criteria:**

| Criterion | Details |
|-----------|---------|
| **Logout Button** | "Logout" button visible post-login on dashboard |
| **API Endpoint** | POST request to `/api/manager/logout` |
| **Session Clear** | Server-side session cleared on logout |
| **Logout Message** | Display: "Logged out." message to confirm |
| **Form Reset** | Login form displayed again, username/password fields cleared |
| **Table Hide** | Orders table hidden/removed from view |
| **No Token Issues** | Logout clears session cookie; no orphaned tokens |
| **Re-login Allowed** | User can login again immediately after logout |

---

## Data Models & Structures

### Menu Item Object
```javascript
{
  itemId: Number,           // Unique item identifier (1-15)
  name: String,             // "Butter Chicken", "Masala Dosa", etc.
  price: Number,            // Price in rupees: 130-320
  cuisine: String           // "North Indian", "South Indian", or "Chinese"
}
```

### Cart Item Object
```javascript
{
  itemId: Number,           // Reference to menu item
  name: String,             // Cached item name for offline availability
  price: Number,            // Cached item price
  quantity: Number          // User-selected quantity (>=1)
}
```

### Cart Structure (localStorage)
```javascript
[
  { itemId: 1, name: "Butter Chicken", price: 320, quantity: 2 },
  { itemId: 5, name: "Paneer Tikka", price: 260, quantity: 1 },
  ...
]
// Stored under key: "restaurant_cart_v1"
```

### Address Object
```javascript
{
  flatHomeDetails: String,  // "Apt 201", "House No. 42", etc.
  area: String,             // Locality/neighborhood name
  landmark: String,         // "Near XYZ Hospital", etc.
  pinCode: String,          // Exactly 6 digits
  city: String,             // "Mumbai", "Bangalore", etc.
  state: String             // One of 28 Indian states
}
```

### Order Object (Request)
```javascript
{
  address: {                // Address object (see above)
    flatHomeDetails: String,
    area: String,
    landmark: String,
    pinCode: String,
    city: String,
    state: String
  },
  items: [                  // Array of cart items with quantity
    { itemId: Number, quantity: Number },
    ...
  ]
}
```

### Order Object (Response)
```javascript
{
  orderId: String,          // 5-digit order ID from server
  status: String,           // "pending", "confirmed", "preparing", "out_for_delivery", "delivered"
  totalPrice: Number,       // Total order amount in rupees
  address: Object,          // Full address object (see above)
  placedAt: String          // ISO timestamp or date string
}
```

### Manager Login Request
```javascript
{
  username: String,         // Manager username
  password: String          // Manager password (sent in request, no hashing client-side)
}
```

---

## Navigation & Entry Points

### Page Navigation Map

```
+----------+
| index.html |
|   (/)    |
+----+-----+
     | Auto-redirect (meta-refresh)
     v
 +--------+------+-------+------+
 |              |       |      |
 v              v       v      v
menu.html  cart.html orders.html manager.html
(/menu)    (/cart)  (/orders)  (/manager)
```

### Navigation Bar Structure
**Available on all pages:** Menu, Cart, My Orders, Manager Access

| Nav Item | Link | Target Page | Visible When |
|----------|------|-------------|--------------|
| Menu | `/menu.html` | Menu browsing | Always |
| Cart | `/cart.html` | Shopping cart | Always |
| My Orders | `/orders.html` | Order tracking | Always |
| Manager Access | `/manager.html` | Manager dashboard | Always |

### Entry Points
- **Primary:** `http://localhost/` → redirects to `/menu.html`
- **Direct URLs:** Users can directly access `/menu.html`, `/cart.html`, `/orders.html`, `/manager.html`
- **No Authentication Gate:** All pages except manager dashboard accessible without auth

### User Journey Flows

#### Customer Flow
```
Menu (Browse) → Add to Cart → Navigate to Cart → 
Delete Items (optional) → Proceed to Billing → 
Enter Address → Place Order → Get Order ID →
Navigate to Orders → Track Order by ID
```

#### Manager Flow
```
Navigate to Manager → Login → View Orders Table → 
Refresh Orders (optional) → Logout
```

---

## Integration Points (APIs)

### API Overview
All APIs are RESTful endpoints with:
- Content-Type: `application/json`
- CORS enabled for frontend origin
- Session-based auth for manager endpoints

### 1. GET /api/menu
**Purpose:** Fetch restaurant menu items  
**When Called:** On menu.html page load  
**Request:** No parameters  
**Response Success (200):**
```javascript
[
  { itemId: 1, name: "Butter Chicken", price: 320, cuisine: "North Indian" },
  { itemId: 2, name: "Paneer Tikka", price: 260, cuisine: "North Indian" },
  ...
  // 15 items total
]
```
**Response Error:** Falls back to hardcoded menu; error message logged  
**Timeout:** Browser default (typically 30-60 seconds)  
**Fallback Behavior:** If API fails, hardcoded menu with 15 items used

---

### 2. POST /api/orders
**Purpose:** Create new customer order  
**When Called:** When customer submits billing form on cart.html  
**Request Body:**
```javascript
{
  address: {
    flatHomeDetails: String,
    area: String,
    landmark: String,
    pinCode: String,        // Must be 6 digits
    city: String,
    state: String           // One of 28 Indian states
  },
  items: [
    { itemId: Number, quantity: Number },
    ...
  ]
}
```
**Response Success (201 or 200):**
```javascript
{
  orderId: String,          // 5-digit ID
  status: String,           // "pending" initially
  totalPrice: Number,
  address: {...},
  placedAt: String          // Timestamp
}
```
**Response Error (400/500):** Error message from server displayed to user  
**Validation (Client-side):**
- All address fields required
- Pin code exactly 6 digits
- Cart not empty
- All items have valid itemId and quantity >= 1

---

### 3. GET /api/orders/{orderId}
**Purpose:** Fetch specific order details for tracking  
**When Called:** When customer enters order ID and clicks Track on orders.html  
**Request:**
- Parameter: `orderId` (URL path parameter)
- No request body
**Response Success (200):**
```javascript
{
  orderId: String,
  status: String,           // One of: pending, confirmed, preparing, out_for_delivery, delivered
  totalPrice: Number,
  address: {...}
}
```
**Response Error (404):** Order not found  
**Response Error (400):** Invalid order ID format  
**Client Validation:** No empty orderId submission

---

### 4. POST /api/manager/login
**Purpose:** Authenticate manager and create session  
**When Called:** When manager enters username/password and clicks Login on manager.html  
**Request Body:**
```javascript
{
  username: String,
  password: String
}
```
**Request Headers:** `credentials: "include"` (include cookies)  
**Response Success (200 or 201):**
```javascript
{
  // Session cookie set by Set-Cookie header
  // Response body may contain user info or empty
}
```
**Response Error (401 or 403):** Invalid credentials  
**Session Management:** Server creates session cookie; browser auto-includes in subsequent requests  
**Security Notes:** Password sent in plaintext in request body (HTTPS recommended for production)

---

### 5. GET /api/manager/orders
**Purpose:** Fetch all orders for manager dashboard  
**When Called:** After successful login, and on Refresh button click  
**Request:** 
- No parameters
- Sent with session cookie (credentials: "include")
**Response Success (200):**
```javascript
[
  {
    orderId: String,
    address: { flatHomeDetails, area, landmark, pinCode, city, state },
    items: [{ name: String, quantity: Number }, ...],
    totalPrice: Number,
    status: String,
    placedAt: String        // Timestamp
  },
  ...
]
```
**Response Error (401):** Session expired or invalid  
**Response Error (500):** Server error  
**Session Requirement:** Call fails if session cookie invalid/expired

---

### 6. POST /api/manager/logout
**Purpose:** Terminate manager session  
**When Called:** When manager clicks Logout button on manager.html  
**Request:** No body  
**Request Headers:** Session cookie included (credentials: "include")  
**Response Success (200):**
```javascript
{
  // Usually empty body or success message
}
```
**Session Management:** Server clears session; subsequent calls will be unauthorized  
**Post-Logout:** Manager returned to login form

---

## Error Handling & Validation Rules

### Client-Side Validation Rules

| Page | Field/Action | Validation Rule | Error Message |
|------|--------------|-----------------|---------------|
| **Menu** | Add to Cart button | Cart storage check | "Add to cart failed due to browser storage restrictions." |
| **Cart** | Delete item | Item exists in cart | (Silently remove from display) |
| **Cart** | Proceed to billing | Cart not empty | "Add at least one item before billing." |
| **Cart** | Flat/Home Details | Required, not empty | (Form validation prevents submit) |
| **Cart** | Area | Required, not empty | (Form validation prevents submit) |
| **Cart** | Landmark | Required, not empty | (Form validation prevents submit) |
| **Cart** | Pin Code | Exactly 6 digits | (HTML5 pattern: `[0-9]{6}`) |
| **Cart** | City | Required, not empty | (Form validation prevents submit) |
| **Cart** | State | Selection required (dropdown) | (Default empty selection) |
| **Orders** | Order ID input | No validation | Show error only after submit |
| **Orders** | Track button submit | Empty field check | "Please enter an order id." |
| **Manager** | Login submission | No client validation | Validated server-side |

### Server Response Error Handling

| Error Scenario | Response Code | User Display | Recovery Action |
|---|---|---|---|
| Menu API fails | 5xx or timeout | "Menu API issue. Showing standard menu. [error details]" | Use hardcoded menu |
| Order placement fails | 4xx, 5xx | Server error message | Allow user to retry |
| Order not found | 404 | "Order not found" | Clear input, allow new search |
| Invalid credentials | 401, 403 | "Invalid credentials." | Keep login form visible |
| Session expired | 401 | "Unauthorized" or "Session expired. Please login again." | Require re-login |
| Network timeout | N/A | Browser default network error | (User retries) |

### Validation Rules Detail

#### Pin Code Validation
- **Type:** Numeric string
- **Length:** Exactly 6 digits
- **Pattern:** `[0-9]{6}`
- **HTML Attribute:** `type="number"` with `pattern="[0-9]{6}"`
- **Error on Invalid:** Form rejects submission

#### Required Fields (Billing Form)
- All 6 address fields must have non-empty values
- HTML5 `required` attribute on all inputs
- Form submit button disabled if any field empty (optional UX enhancement)

#### Address Field Character Limits (recommendations)
| Field | Min Length | Max Length | Allowed Characters |
|-------|-----------|-----------|-------------------|
| Flat/Home Details | 2 | 50 | Alphanumeric, spaces, slashes, hyphens, periods |
| Area | 2 | 50 | Alphanumeric, spaces, hyphens |
| Landmark | 2 | 100 | Alphanumeric, spaces, hyphens, parentheses |
| City | 2 | 30 | Alphabetic, spaces |
| State | N/A | N/A | Dropdown selection (28 predefined states) |

#### Order ID Format
- **Length:** Exactly 5 digits
- **Type:** Numeric
- **Pattern:** `[0-9]{5}`
- **Case Sensitivity:** Not applicable (numeric)

---

## Browser Storage & Session Management

### LocalStorage (Client-Side Cart Persistence)

**Storage Key:** `restaurant_cart_v1`  
**Storage Type:** Browser's localStorage API  
**Data Structure:**
```javascript
[
  { itemId: Number, name: String, price: Number, quantity: Number },
  { itemId: Number, name: String, price: Number, quantity: Number },
  ...
]
```

**Storage Operations:**
1. **Read:** `JSON.parse(localStorage.getItem('restaurant_cart_v1'))`
2. **Write:** `localStorage.setItem('restaurant_cart_v1', JSON.stringify(cart))`
3. **Clear:** `localStorage.removeItem('restaurant_cart_v1')`

**Persistence Behavior:**
- Cart persists across page refreshes
- Cart persists across browser sessions (until localStorage cleared)
- Cart cleared automatically after order placement
- Cart cleared if user manually clears browser storage

**Fallback:** If localStorage unavailable (private/incognito mode):
- Store cart in memory (JavaScript variable)
- Show warning: "Cart stored in memory; will be lost if page closed"
- Cart lost on page navigation or refresh

**Data Loss Scenarios:**
- User manually clears browser cache/storage
- Private/incognito mode close
- Browser storage quota exceeded
- localStorage API disabled in browser settings

### Session Storage (Manager Login)

**Session Type:** Server-side session (HTTP cookies)  
**Cookie Name:** (Server-defined; typically `sessionid` or `session`)  
**Session Duration:** Server-defined (typical: 30 minutes to 2 hours)  
**Secure Flag:** Should be `Secure` in production (HTTPS only)  
**HttpOnly Flag:** Should be `HttpOnly` to prevent JavaScript access  
**Client Behavior:**
- Cookies auto-included in all requests via `credentials: "include"`
- No client-side token management required
- No manual session management by frontend code

**Session Loss Scenarios:**
- User logs out (POST `/api/manager/logout`)
- Session timeout on server (inactivity)
- Browser cookies cleared
- Different browser/device (session server-side, not token-based)

**Post-Logout:** User returned to login form; orders table hidden

---

## Shared Functionality Utilities

### Global Utilities (window.RestaurantShared)

| Utility Name | Function | Parameters | Returns | Usage |
|---|---|---|---|---|
| `formatMoney(value)` | Format number in Indian locale | `value: Number` | `String` (e.g., "1,20,000") | All price displays |
| `formatAddress(address)` | Convert address object to string | `address: Object` | `String` (comma-separated) | Order display |
| `getCart()` | Retrieve cart from storage | None | `Array` of cart items | On page load |
| `getCartItemCount()` | Get total item quantity | None | `Number` | Update nav counter |
| `saveCart(cart)` | Persist cart to storage | `cart: Array` | Void | After add/remove |
| `addToCart(item)` | Add/increment item | `item: Object` | Void | Menu add button |
| `removeFromCart(itemId)` | Remove item by ID | `itemId: Number` | Void | Cart delete button |
| `fetchMenu()` | GET menu from API | None | `Promise<Array>` | Menu page load |
| `fetchOrder(orderId)` | GET specific order | `orderId: String` | `Promise<Object>` | Order tracking |
| `placeOrder(payload)` | POST new order | `payload: Object` | `Promise<Object>` | Cart checkout |
| `loginManager(username, password)` | POST manager login | `username: String, password: String` | `Promise<Response>` | Manager login |
| `fetchManagerOrders()` | GET all orders | None | `Promise<Array>` | Manager dashboard |
| `logoutManager()` | POST manager logout | None | `Promise<Response>` | Manager logout |
| `syncCartNavCount()` | Update nav cart display | None | Void | After cart changes |

---

## Summary of Key Features

### For Product Owners Creating User Stories

**Key Breakdown:**

1. **Public Features (No Auth):**
   - Menu browsing (15 items, 3 categories)
   - Shopping cart (add, remove, persist)
   - Order placement (with delivery address)
   - Order tracking (by 5-digit order ID)
   - Dynamic cart counter in navigation

2. **Protected Features (Manager Auth):**
   - Login/logout functionality
   - View all customer orders
   - Refresh order list
   - Session-based persistence

3. **Technical Constraints:**
   - Client-side storage: localStorage (fallback to memory)
   - Server-side storage: Session cookies
   - No JWT tokens in current design
   - Offline capability: Limited (menu can be hardcoded, orders require API)

4. **Data Scope:**
   - 15 fixed menu items
   - 28 Indian states in address field
   - 5-digit order IDs (tracked and displayed)
   - Open-ended order statuses (pending, confirmed, preparing, out_for_delivery, delivered)

5. **Validation Scope:**
   - Client-side: Basic form validation (required fields, pin code format)
   - Server-side: Credentials, inventory, business logic

---

## Integration with Development Teams

### Frontend Development Checklist
- [ ] Menu items loaded from API `/api/menu`
- [ ] Cart persisted to localStorage with key `restaurant_cart_v1`
- [ ] Address form validates pin code as 6 digits
- [ ] Order ID returned and displayed from POST `/api/orders`
- [ ] Manager session stored via HTTP cookies
- [ ] All prices formatted using Indian locale
- [ ] Navigation counter syncs across pages
- [ ] Error messages match specification
- [ ] Fallback menu loads if API fails

### Backend API Checklist
- [ ] GET `/api/menu` returns 15 items with itemId, name, price, cuisine
- [ ] POST `/api/orders` creates order and returns orderId, status, totalPrice
- [ ] GET `/api/orders/{orderId}` returns order by ID for tracking
- [ ] POST `/api/manager/login` sets session cookie on success
- [ ] GET `/api/manager/orders` returns all orders (requires valid session)
- [ ] POST `/api/manager/logout` clears session
- [ ] All endpoints support CORS from frontend origin
- [ ] Session management uses HTTP-only, secure cookies

---

**Document Prepared By:** Frontend Analysis  
**Approval Status:** Ready for Product Owner Review  
**Version History:** v1.0 - Initial comprehensive feature documentation
