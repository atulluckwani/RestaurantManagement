# RestaurantManagement

Restaurant management web app with a vanilla frontend and Node.js + TypeScript backend.

## Features

- Menu with 3 cuisines (North Indian, South Indian, Chinese), 5 items each.
- Add to cart and dynamic total pricing.
- Proceed to billing with delivery address input.
- Order creation with generated order id.
- My Orders tracking by order id.
- Order status starts as `In process` and auto-updates to `Delivered` after 30 minutes.
- Manager login (`Admin` / `Admin`) with backend-enforced session.
- Manager dashboard table listing all customer orders.
- Task CRUD REST API under `/api/tasks`.
- JSON file persistence for orders and tasks.
- CORS enabled.

## Run

1. Install dependencies:

```bash
npm install
```

2. Start in dev mode:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Start built app:

```bash
npm run start
```

App URL: `http://localhost:3000`

## Scripts

- `npm run dev` run server with watcher using `tsx`.
- `npm run build` compile TypeScript into `dist/`.
- `npm run typecheck` type validation only.
- `npm run start` run compiled backend.
- `npm run clean` remove the `dist/` directory.

## REST API

### Tasks API

- `GET /api/tasks` get all tasks.
- `POST /api/tasks` create task.
	- Body: `{ "title": "Call supplier", "completed": false }`
- `PUT /api/tasks/:id` update task title/completed.
- `DELETE /api/tasks/:id` delete task.

### Restaurant API

- `GET /api/menu` get menu grouped by cuisine.
- `POST /api/orders` place order.
	- Body:

```json
{
	"address": "221B MG Road, Bengaluru",
	"items": [
		{ "itemId": "ni-1", "quantity": 1 },
		{ "itemId": "ch-2", "quantity": 2 }
	]
}
```

- `GET /api/orders/:orderId` get order tracking details.

### Manager API

- `POST /api/manager/login`
	- Body: `{ "username": "Admin", "password": "Admin" }`
- `GET /api/manager/session` validate manager session.
- `POST /api/manager/logout` clear manager session.
- `GET /api/manager/orders` list all orders (requires manager login).

## Persistence

- Orders are stored in `data/orders.json`.
- Tasks are stored in `data/tasks.json`.

## Project structure

- `src/index.ts` backend app bootstrap.
- `src/routes/tasks.ts` task endpoints.
- `src/routes/restaurant.ts` menu, orders, manager endpoints.
- `src/services/orderStatusScheduler.ts` 30-minute delivery status update.
- `src/public/index.html` frontend sections.
- `src/public/styles.css` responsive design and animations.
- `src/public/app.js` frontend behavior.
- `data/orders.json` persisted orders.
- `data/tasks.json` persisted tasks.
