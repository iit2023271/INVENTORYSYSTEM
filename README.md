<div align="center">

# 🧁 Bakery Inventory & Kiosk System

### A self-service ordering kiosk + complete bakery management platform — built for real shop operations.

<br/>

[![Live Kiosk](https://img.shields.io/badge/🟢%20Live%20Kiosk-inventorysystem--silk.vercel.app-brightgreen?style=for-the-badge)](https://inventorysystem-silk.vercel.app/menu)

[![GitHub](https://img.shields.io/badge/](https://github.com/iit2023271/INVENTORYSYSTEM)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image%20CDN-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)](https://render.com)

</div>

---

## 📖 About

The Bakery Inventory & Kiosk System is a production-ready, full-stack web application that digitalises both the front-of-house and back-office operations of a small-to-mid-sized bakery. On the customer side, a large-screen self-service kiosk — styled like the ordering terminals at fast food chains — lets walk-in customers browse the menu, build their cart, and walk away with a token number in seconds, no cashier needed. On the owner side, a secure, JWT-protected dashboard gives complete control over the business: a live three-stage order pipeline, daily stock management that auto-disables sold-out products, custom wedding-cake orders with advance-payment tracking, raw material purchase logging, full price history records, and profit reports that calculate net income by subtracting daily expenses from completed-order revenue. Every price change is stored as a historical record rather than overwriting the old one, and every order permanently captures the price at time of sale — so financial reports are always accurate no matter how many times prices change in the future.

---

## 📚 Table of Contents

- [Demo](#-demo)
- [Screenshots](#-screenshots)
- [System Architecture](#-system-architecture)
- [Application Workflows](#-application-workflows)
- [Features — All 18 Pages](#-features--all-18-pages)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Design Decisions](#-design-decisions)
- [Author](#-author)
- [License](#-license)

---

## 🎬 Demo

### 📺 Video Walkthrough

<!-- 
  HOW TO ADD YOUR DEMO VIDEO:

  OPTION 1 — YouTube / Loom (recommended):
  Replace the placeholder below with your actual thumbnail and link.

      [![Demo Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://youtu.be/lfVVm5K-Xp0?si=0raAVsiDRGcb5bfv)

  OPTION 2 — Upload to GitHub directly:
  - Go to any GitHub Issue in your repo → drag & drop the video file to upload it
  - GitHub will generate a URL like: https://github.com/user-attachments/assets/...
  - Paste that URL into a video tag:

      <video src="https://github.com/user-attachments/assets/YOUR-VIDEO-URL" controls width="100%"></video>

  OPTION 3 — GitHub Releases:
  - Go to Releases → Create a new release → attach your video file
  - Use the release asset URL in a <video> tag (same as Option 2)
-->

> 🎥 [![Demo Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://youtu.be/lfVVm5K-Xp0?si=0raAVsiDRGcb5bfv)

---

## 📸 Screenshots


<!-- 
  HOW TO ADD SCREENSHOTS:

  1. Create the folder: assets/screenshots/ in your repo root
  2. Upload each screenshot with the exact filename shown below
  3. GitHub will render them in the compact gallery

  Images use HTML width attributes so they stay small and aligned in GitHub's README preview.

  Recommended filenames (must match exactly):
    customer-menu.jpg
    checkout.jpg
    order-token.jpg
    login.jpg
    dashboard.jpg
    orders.jpg
    products.jpg
    add-product.jpg
    deleted-products.jpg
    raw-materials.jpg
    add-raw-material.jpg
    deleted-raw-materials.jpg
    raw-purchases.jpg
    add-raw-purchase.jpg
    customers.jpg
    customer-details.jpg
    reports.jpg
    add-custom-order.jpg
    orders-summary.jpg
-->

### 🧍 Customer Kiosk

| Customer Menu | Checkout | Token Screen |
|---|---|---|
| <img src="assets/screenshots/customer-menu.jpg" alt="Customer Menu" width="220"> | <img src="assets/screenshots/checkout.jpg" alt="Checkout" width="220"> | <img src="assets/screenshots/order-token.jpg" alt="Token Screen" width="220"> |
| Product grid, categories, cart | Cart review with customer details | Order confirmed with token number |

---

### 🔐 Auth & Order Management

| Login | Dashboard | Orders |
|---|---|---|
| <img src="assets/screenshots/login.jpg" alt="Login" width="220"> | <img src="assets/screenshots/dashboard.jpg" alt="Dashboard" width="220"> | <img src="assets/screenshots/orders.jpg" alt="Orders" width="220"> |
| Owner authentication | Live order pipeline | Full historical order list |

---

### 📦 Product Management

| Products | Add Product | Deleted Products |
|---|---|---|
| <img src="assets/screenshots/products.jpg" alt="Products" width="220"> | <img src="assets/screenshots/add-product.jpg" alt="Add Product" width="220"> | <img src="assets/screenshots/deleted-products.jpg" alt="Deleted Products" width="220"> |
| Active catalogue and stock controls | Image crop and Cloudinary upload | Restore soft-deleted items |

---

### 🥦 Raw Materials & Purchases

| Raw Materials | Add Raw Material | Deleted Raw Materials |
|---|---|---|
| <img src="assets/screenshots/raw-materials.jpg" alt="Raw Materials" width="220"> | <img src="assets/screenshots/add-raw-material.jpg" alt="Add Raw Material" width="220"> | <img src="assets/screenshots/deleted-raw-materials.jpg" alt="Deleted Raw Materials" width="220"> |
| Ingredient catalogue | Register new ingredient | Restore deleted materials |

| Raw Purchases | Add Raw Purchase |
|---|---|
| <img src="assets/screenshots/raw-purchases.jpg" alt="Raw Purchases" width="220"> | <img src="assets/screenshots/add-raw-purchase.jpg" alt="Add Raw Purchase" width="220"> |
| Track purchases and status | Log new ingredient purchase |

---

### 👥 Customers, Reports & Custom Orders

| Customers | Customer Details | Reports |
|---|---|---|
| <img src="assets/screenshots/customers.jpg" alt="Customers" width="220"> | <img src="assets/screenshots/customer-details.jpg" alt="Customer Details" width="220"> | <img src="assets/screenshots/reports.jpg" alt="Reports" width="220"> |
| Customers grouped by phone | Full order history per customer | Daily and range profit reports |

| Add Custom Order | Orders Summary |
|---|---|
| <img src="assets/screenshots/add-custom-order.jpg" alt="Add Custom Order" width="220"> | <img src="assets/screenshots/orders-summary.jpg" alt="Orders Summary" width="220"> |
| Bespoke order and advance payment tracking | Summary of received orders |

---

## 🏗 System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                                                                  │
│   ┌───────────────────────┐    ┌────────────────────────────┐   │
│   │   Customer Kiosk      │    │      Owner Dashboard       │   │
│   │   /menu               │    │   /login  /dashboard       │   │
│   │   /checkout           │    │   /orders /products  etc.  │   │
│   │        │    │                            │   │
│   │   (Public Routes)     │    │   (JWT Protected Routes)   │   │
│   └──────────┬────────────┘    └──────────────┬─────────────┘   │
│              │                                │                  │
│              └───────────────┬────────────────┘                  │
│                              │  React.js + React Router          │
│                              │  Deployed on Vercel               │
└──────────────────────────────┼──────────────────────────────────┘
                               │ HTTPS REST API
                               │ (REACT_APP_API_URL)
┌──────────────────────────────┼──────────────────────────────────┐
│                          API LAYER                               │
│                              │                                   │
│               ┌──────────────▼─────────────┐                    │
│               │      Express.js Server      │                    │
│               │   Node.js  ·  server.js     │                    │
│               │   Deployed on Render        │                    │
│               └──────────────┬─────────────┘                    │
│                              │                                   │
│       ┌──────────────────────┼─────────────────────┐            │
│       │                      │                     │            │
│  ┌────▼──────┐   ┌───────────▼──────────┐  ┌──────▼───────┐   │
│  │ JWT Auth  │   │   12 Controllers      │  │  Cloudinary  │   │
│  │Middleware │   │   (business logic)    │  │  Middleware  │   │
│  └───────────┘   └───────────┬──────────┘  └──────────────┘   │
└─────────────────────────────-┼──────────────────────────────────┘
                               │ Mongoose ODM
┌──────────────────────────────┼──────────────────────────────────┐
│                         DATA LAYER                               │
│                              │                                   │
│               ┌──────────────▼─────────────┐                    │
│               │       MongoDB Atlas         │                    │
│               │                            │                    │
│               │  users · products          │                    │
│               │  orders · customorders     │                    │
│               │  stockentries              │                    │
│               │  rawmaterials · rawpurchases│                   │
│               │  productprices · categories│                    │
│               └────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
                  External: Cloudinary CDN
                  (image upload, optimisation, delivery)
```

---

## 🔄 Application Workflows

### 1. Customer Order Flow

```
Customer arrives at kiosk screen  →  /menu
             │
             ▼
  ┌──────────────────────┐
  │   Browse Products    │  ← GET /api/products  (active, non-deleted)
  │   Filter by category │    GET /api/stock/today (0-stock items hidden)
  │   See images + price │
  └──────────┬───────────┘
             │  Taps "Add to Cart"
             ▼
  ┌──────────────────────┐
  │   Cart Sidebar       │  ← Adjust qty, see running total
  │   Review items       │
  └──────────┬───────────┘
             │  Taps "Checkout"  →  /checkout
             ▼
  ┌──────────────────────┐
  │  Enter Name +        │  ← Required: customerName, customerPhone
  │  Phone Number        │
  └──────────┬───────────┘
             │  Confirms order
             ▼
  ┌──────────────────────┐
  │  POST /api/orders    │  ← Backend saves order
  │                      │     · priceAtSale stored per line item
  │                      │     · Token number generated
  │                      │     · Customer phone saved for history
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────────────┐
  │  Token Number Screen │  ← 
  │  shown on kiosk      │     Customer waits, shows token at counter
  └──────────────────────┘
```

---

### 2. Owner Order Pipeline

```
New order arrives  →  Dashboard (/dashboard)
              │
              ▼
      ┌───────────────┐
      │   PENDING     │  ← Visible immediately after customer submits
      │               │     Shows: token#, customer name, items, total
      └───────┬───────┘
              │  Owner clicks "Mark Done"
              │  PATCH /api/orders/:id/done
              ▼
      ┌───────────────┐
      │     DONE      │  ← Staff are actively preparing this order
      │               │     Visual signal to kitchen/counter
      └───────┬───────┘
              │  Owner clicks "Complete"
              │  PATCH /api/orders/:id/complete
              ▼
      ┌───────────────┐
      │   COMPLETED   │  ← Order handed to customer
      │               │     ✓ Stock auto-deducted per item qty
      │               │     ✓ Revenue logged for profit reports
      │               │     ✓ Customer order history updated
      └───────────────┘

      At any stage → "Cancel"  →  PATCH /api/orders/:id/cancel
                                   No stock deducted · No revenue logged

      Full history viewable on:  /orders  and  /orders-summary
```

---

### 3. Daily Stock Workflow

```
Every morning — owner opens Stock management
              │
              ▼
  ┌─────────────────────────┐
  │  Enter qty for each     │  ← POST /api/stock/update
  │  product                │     Creates fresh StockEntry docs
  │  e.g. croissants: 20    │     keyed by productId + today's date
  │       cakes: 8          │
  └────────────┬────────────┘
               │
               ▼
  ┌─────────────────────────┐
  │  Kiosk reflects stock   │  ← GET /api/stock/today
  │  Products with qty = 0  │     Zero-stock items hidden on /menu
  │  are hidden from menu   │
  └────────────┬────────────┘
               │  Throughout the day, as orders complete...
               ▼
  ┌─────────────────────────┐
  │  Stock auto-decrements  │  ← On PATCH .../complete
  │  per completed order    │     orderController deducts ordered qty
  └────────────┬────────────┘
               │
               ▼
  ┌─────────────────────────┐
  │  Product hits 0 stock   │  ← Automatically disabled on kiosk
  │                         │     Cannot be ordered until restocked
  └─────────────────────────┘
```

---

### 4. Price Change Workflow

```
Owner sets a new price for a product
              │
              ▼
  ┌──────────────────────────────────────────────────┐
  │  POST /api/prices                                │
  │  { productId, newPrice }                         │
  └──────────────────┬───────────────────────────────┘
                     │
                     ▼
  ┌──────────────────────────────────────────────────┐
  │  Backend closes current ProductPrice record      │
  │  Sets  toDate = today  on the existing record    │
  │                                                  │
  │  Creates NEW ProductPrice record:                │
  │  { price: newPrice, fromDate: today, toDate: null}│
  └──────────────────────────────────────────────────┘
                     │
                     ▼
  ┌──────────────────────────────────────────────────┐
  │  Future orders  →  use new price                 │
  │  Past orders    →  priceAtSale unchanged          │
  │  Full history   →  always queryable              │
  └──────────────────────────────────────────────────┘
```

---

### 5. Custom Order Workflow

```
Customer contacts owner (phone / walk-in) for a wedding cake, bulk order, etc.
              │
              ▼
  ┌──────────────────────────┐
  │  Owner opens             │
  │  AddCustomOrder page     │  ← POST /api/custom-orders
  │                          │     Stores: customerName, customerPhone,
  │  Enters:                 │     description, totalPrice,
  │  · Customer details      │     advancePaid, balanceDue,
  │  · Order description     │     status = PENDING
  │  · Total price           │
  │  · Advance payment       │
  └────────────┬─────────────┘
               │
               ▼
       ┌───────────────┐
       │   PENDING     │  ← Logged, advance recorded, balance tracked
       └───────┬───────┘
               │  PATCH /api/custom-orders/:id/done
               ▼
       ┌───────────────┐
       │     DONE      │  ← Custom item is being prepared
       └───────┬───────┘
               │  PATCH /api/custom-orders/:id/complete
               ▼
       ┌───────────────┐
       │   COMPLETED   │  ← Delivered · Balance collected
       └───────────────┘
```

---

### 6. Raw Material Purchase Workflow

```
Owner needs to buy ingredients / packaging supplies
              │
              ▼
  ┌─────────────────────────┐
  │  Ensure material exists │  ← POST /api/raw-materials  (if new)
  │  in catalogue           │     e.g. "Refined Flour", "Butter"
  │  (RawMaterials page)    │
  └────────────┬────────────┘
               │
               ▼
  ┌─────────────────────────┐
  │  Log the purchase       │  ← POST /api/raw-purchases
  │  (AddRawPurchase page)  │     Stores: material(ref), qty,
  │                         │     unitPrice, totalCost,
  │                         │     purchaseDate, status = PENDING
  └────────────┬────────────┘
               │
               ▼
       ┌─────────────┐
       │   PENDING   │  ← Ordered, not yet received
       └──────┬──────┘
              │  Goods arrive  →  PATCH /api/raw-purchases/:id/done
              ▼
       ┌─────────────┐
       │    DONE     │  ← Confirmed received
       │             │     ✓ Cost recorded as expense for that date
       │             │     ✓ Feeds into daily expense report
       └─────────────┘
```

---

### 7. Reporting Workflow

```
Owner opens Reports page  →  /reports
         │
         ├── Daily Profit Report ─────────────────────────────────────┐
         │   GET /api/reports/profit?date=YYYY-MM-DD                  │
         │                                                             │
         │   Revenue  = SUM of priceAtSale × qty  (completed orders)  │
         │   Expenses = SUM of totalCost  (confirmed raw purchases)   │
         │   ─────────────────────────────────────────────────────    │
         │   Net Profit = Revenue − Expenses                          │
         │                                                             │
         ├── Date Range Profit Report ────────────────────────────────┤
         │   GET /api/reports/profit/range?start=...&end=...          │
         │                                                             │
         │   Same calculation across every day in the range           │
         │   Useful for weekly / monthly / custom period reviews      │
         │                                                             │
         └── Daily Expense Report ────────────────────────────────────┘
             GET /api/reports/expense?date=YYYY-MM-DD

             Full breakdown of every confirmed raw purchase for the day
```

---

## ✨ Features — All 18 Pages

### 🧍 Customer-Facing Pages (Public — No Login Required)

| # | Route | What It Does |
|---|---|---|
| 1 | `/menu` | Large-screen kiosk product grid. Shows all active products with Cloudinary images, current prices, and live stock status. Products with zero stock are hidden. Customers browse by category and add items to the cart. |
| 2 | `/checkout` | Cart review screen with quantity controls and a live running total. Customer enters their name and phone number. On confirmation, the order is submitted to the backend with `priceAtSale` locked per item. |
| 3 | | Token number receipt screen displayed after a successful order. The large token number tells the customer what to quote at the counter when their order is ready. Also used by the owner as a read-only order summary list. |

---

### 🔐 Auth

| # | Route | What It Does |
|---|---|---|
| 4 | `/login` | Owner login form. Sends credentials to `POST /api/auth/login`, receives a JWT token, stores it in `localStorage`, and redirects to the dashboard. All subsequent protected routes read this token from storage. |

---

### 📋 Order Management

| # | Route | What It Does |
|---|---|---|
| 5 | `/dashboard` | The owner's primary working view. Displays three live columns — Pending, Done, Completed — with action buttons on each order card. Completing an order triggers automatic stock deduction. |
| 6 | `/orders` | Full searchable and filterable history of all orders across all statuses. Useful for resolving disputes and reviewing past activity. |

---

### 📦 Product Management

| # | Route | What It Does |
|---|---|---|
| 7 | `/products` | Active product catalogue. Each product card shows its image, name, category, current price, and enable/disable toggle. Soft-delete sends the product to the deleted list without breaking order history. |
| 8 | `/add-product` | Form to add a new product. The owner fills in name, category, and price, then uploads an image which passes through the image cropper for consistent aspect-ratio cropping before being sent to Cloudinary. |
| 9 | `/deleted-products` | Lists all soft-deleted products. Each entry has a Restore button that sets `isDeleted: false` and makes the product visible on the kiosk again. Order history referencing the product is always preserved. |

---

### 🥦 Raw Material Management

| # | Route | What It Does |
|---|---|---|
| 10 | `/raw-materials` | Full catalogue of all active raw materials used in the bakery. Shows name, unit of measure, and category. Links to add new entries and view deleted ones. |
| 11 | `/add-raw-material` | Form to register a new raw material in the catalogue before purchases can be logged against it. Captures name, unit (kg, litres, etc.), and category. |
| 12 | `/deleted-raw-materials` | Lists all soft-deleted raw materials with a restore button. Prevents orphaned purchase records by never hard-deleting materials that have purchase history. |

---

### 🛒 Raw Purchase Tracking

| # | Route | What It Does |
|---|---|---|
| 13 | `/raw-purchases` | All logged raw material purchases with Pending/Done status, quantities, unit price, total cost, and purchase date. Confirmed (Done) purchases feed the daily expense report. |
| 14 | `/add-raw-purchase` | Form to log a new raw material purchase. The owner selects the material from the catalogue, enters quantity and unit price, and the total cost is calculated automatically. |

---

### 👥 Customer Management

| # | Route | What It Does |
|---|---|---|
| 15 | `/customers` | All customers who have ever placed an order, grouped by phone number. Shows order count and total spend per customer. Useful for identifying loyal repeat customers. |
| 16 | `/customers/:phone` | Full order history for one specific phone number — every order placed, with date, items ordered, and amount paid. Useful for resolving customer queries. |

---

### 📈 Reports & Custom Orders

| # | Route | What It Does |
|---|---|---|
| 17 | `/reports` | Daily and date-range profit reports (revenue minus expenses) and daily expense breakdowns. Revenue figures use `priceAtSale` values from completed orders so historical reports are always accurate. |
| 18 | `/add-custom-order` | Form to create a bespoke order (wedding cakes, bulk event orders). Records customer details, order description, total agreed price, advance payment received, and outstanding balance due. |

---

## 🛠 Tech Stack

| Technology | Purpose | Why Chosen |
|---|---|---|
| **React.js 18** | Frontend UI | Component model cleanly separates kiosk and dashboard into independent trees; hooks make cart state and form logic simple |
| **React Router v6** | Client-side routing | Declarative protected-route wrappers let `/menu` stay fully public while `/dashboard` and beyond require a valid JWT |
| **Node.js 18** | Backend runtime | Non-blocking I/O handles simultaneous order POSTs from the kiosk without queuing or blocking the owner's dashboard requests |
| **Express.js 4** | HTTP server and API | Minimal, unopinionated; thin route files delegate to controller files — concerns are cleanly separated throughout |
| **MongoDB Atlas** | Primary database | Document model accommodates the varied shapes of orders, custom orders, stock entries, and price history without schema migrations |
| **Mongoose** | MongoDB ODM | Schema validation, pre-save hooks (e.g. auto-disable on zero stock), and clean query syntax over the raw MongoDB driver |
| **JWT** | Owner authentication | Stateless token auth is ideal for a single-admin system; no session table needed, works seamlessly across Vercel + Render |
| **Cloudinary** | Image storage & CDN | Handles upload, optimisation, resizing, and global delivery — the Node server never serves a single static asset |
| **ImageCropper** | In-browser image crop | Ensures all product images are cropped to a consistent aspect ratio before upload, keeping the kiosk grid visually uniform |
| **Vercel** | Frontend hosting | Zero-config React deployment with automatic HTTPS and global edge CDN |
| **Render** | Backend hosting | Free-tier Node.js hosting with persistent environment variables and straightforward MongoDB Atlas connectivity |

---

## 📁 Project Structure

```
INVENTORYSYSTEM/
│
├── backend/
│   │
│   ├── controllers/                          # Business logic — 12 files, one per domain
│   │   ├── authController.js                 # Validate credentials, issue JWT
│   │   ├── categoryController.js             # Product category CRUD
│   │   ├── customerController.js             # Aggregate orders grouped by phone number
│   │   ├── customOrderController.js          # Create + Pending→Done→Completed flow for custom orders
│   │   ├── expenseReportController.js        # Sum confirmed raw-purchase costs per date
│   │   ├── orderController.js                # Place order (priceAtSale), status transitions, stock deduction
│   │   ├── productController.js              # CRUD + Cloudinary upload + soft-delete + enable/disable
│   │   ├── productPriceController.js         # Close old price record, open new; current-price query
│   │   ├── profitReportController.js         # Revenue − expenses for day or date range
│   │   ├── rawMaterialController.js          # Catalogue CRUD + soft-delete
│   │   ├── rawPurchaseController.js          # Log purchase, confirm receipt → records as expense
│   │   └── stockController.js               # Daily stock entry, today's query, zero-stock disabling
│   │
│   ├── models/                               # Mongoose schemas — shape of every MongoDB document
│   │   ├── Category.js                       # { name, description }
│   │   ├── CustomOrder.js                    # { customerName, phone, description, totalPrice, advancePaid, balanceDue, status }
│   │   ├── Order.js                          # { customerName, phone, tokenNumber, items[{product, name, qty, priceAtSale}], status }
│   │   ├── Product.js                        # { name, category, imageUrl, cloudinaryId, isEnabled, isDeleted }
│   │   ├── ProductPrice.js                   # { product, price, fromDate, toDate }  — append-only history
│   │   ├── RawMaterial.js                    # { name, unit, category, isDeleted }
│   │   ├── RawPurchase.js                    # { material(ref), qty, unitPrice, totalCost, purchaseDate, status }
│   │   ├── StockEntry.js                     # { product(ref), date, quantityAdded, quantityRemaining }
│   │   └── User.js                           # { email, password(hashed) }  — single owner account
│   │
│   ├── routes/                               # Express route definitions — thin, delegates to controllers
│   │   ├── authRoutes.js                     # POST /api/auth/login
│   │   ├── categoryRoutes.js                 # CRUD /api/categories
│   │   ├── customerRoutes.js                 # GET /api/customers  GET /api/customers/:phone
│   │   ├── customOrderRoutes.js              # CRUD + status /api/custom-orders
│   │   ├── expenseReportRoutes.js            # GET /api/reports/expense
│   │   ├── orderRoutes.js                    # POST + GET + status PATCH /api/orders
│   │   ├── productPriceRoutes.js             # POST + GET /api/prices
│   │   ├── productRoutes.js                  # Full product management /api/products
│   │   ├── profitReportRoutes.js             # GET /api/reports/profit  /api/reports/profit/range
│   │   ├── rawMaterialRoutes.js              # CRUD /api/raw-materials
│   │   ├── rawPurchaseRoutes.js              # CRUD + confirm /api/raw-purchases
│   │   └── stockRoutes.js                    # GET today + POST update /api/stock
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js                 # Verify JWT on every protected route, attach owner to req
│   │   └── cloudinaryConfig.js              # Initialise Cloudinary SDK + multer/upload config
│   │
│   ├── setup.js                              # One-time seed: creates default owner account
│   ├── server.js                             # Entry point: connect MongoDB, mount routes, listen
│   └── package.json
│
├── frontend/
│   └── src/
│       │
│       ├── pages/                            # 18 full-page route components
│       │   │
│       │   │   ── CUSTOMER KIOSK (PUBLIC) ──────────────────────────
│       │   ├── CustomerMenu.js               # Product grid kiosk — browse, filter by category, add to cart
│       │   ├── Checkout.js                   # Cart review + name/phone entry + submit order
│       │   ├── OrdersSummary.js              # Token number receipt (public) + order summary (owner)
│       │   │
│       │   │   ── AUTH ───────────────────────────────────────────────
│       │   ├── Login.js                      # Owner login form + JWT storage
│       │   │
│       │   │   ── ORDERS ─────────────────────────────────────────────
│       │   ├── Dashboard.js                  # Live pipeline: Pending → Done → Completed
│       │   ├── Orders.js                     # Full historical order list, all statuses, searchable
│       │   │
│       │   │   ── PRODUCTS ────────────────────────────────────────────
│       │   ├── Products.js                   # Active catalogue with enable/disable/soft-delete
│       │   ├── AddProduct.js                 # Add product form — ImageCropper → Cloudinary upload
│       │   ├── DeletedProducts.js            # Soft-deleted products with restore
│       │   │
│       │   │   ── RAW MATERIALS ──────────────────────────────────────
│       │   ├── RawMaterials.js               # Active raw material catalogue
│       │   ├── AddRawMaterial.js             # Add new raw material to catalogue
│       │   ├── DeletedRawMaterials.js        # Soft-deleted materials with restore
│       │   │
│       │   │   ── RAW PURCHASES ──────────────────────────────────────
│       │   ├── RawPurchases.js               # All logged purchases with Pending/Done status
│       │   ├── AddRawPurchase.js             # Log a new raw material purchase
│       │   │
│       │   │   ── CUSTOMERS ─────────────────────────────────────────
│       │   ├── Customers.js                  # All customers grouped by phone, order count, spend
│       │   ├── CustomerDetails.js            # Full order history for one phone number
│       │   │
│       │   │   ── REPORTS & CUSTOM ORDERS ────────────────────────────
│       │   ├── Reports.js                    # Profit + expense reports, daily and date-range
│       │   └── AddCustomOrder.js             # Bespoke order with advance payment tracking
│       │
│       ├── components/                       # Reusable UI components
│       │   ├── Header.js                     # Owner dashboard nav bar with active route highlighting
│       │   └── ImageCropper.js              # In-browser aspect-ratio crop before Cloudinary upload
│       │
│       ├── App.js                            # Route table, JWT auth context, protected route logic
│       └── index.js                          # React DOM render entry point
│
├── assets/
│   └── screenshots/                          # Screenshot images (add yours here)
│
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Where to Get |
|---|---|---|
| Node.js | v18 or higher | [nodejs.org](https://nodejs.org) |
| npm | v9 or higher | Bundled with Node.js |
| MongoDB | Atlas (free) or local | [mongodb.com/atlas](https://mongodb.com/atlas) |
| Cloudinary account | Free tier | [cloudinary.com](https://cloudinary.com) — need Cloud Name, API Key, API Secret |

---

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/iit2023271/INVENTORYSYSTEM.git
cd INVENTORYSYSTEM

# 2. Enter the backend directory
cd backend

# 3. Install dependencies
npm install

# 4. Create your environment file and fill in values (see below)
cp .env.example .env

# 5. Start the development server
npm run dev
# API running at http://localhost:5000
```

---

### Backend `.env`

Create `backend/.env` — every variable is required.

```env
# ── DATABASE ─────────────────────────────────────────────────────────
# MongoDB Atlas:  mongodb+srv://<user>:<pass>@cluster.mongodb.net/<db>
# Local:          mongodb://localhost:27017/bakery
MONGO_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/bakery

# ── AUTH ─────────────────────────────────────────────────────────────
# Long random string used to sign JWTs — never commit this
# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# ── OWNER SETUP ──────────────────────────────────────────────────────
# Passphrase checked by setup.js when seeding the owner account
OWNER_SECRET=your_owner_setup_passphrase

# ── SERVER ───────────────────────────────────────────────────────────
PORT=5000

# ── CLOUDINARY ───────────────────────────────────────────────────────
# Found at cloudinary.com → Dashboard → Settings → API Keys
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

### Frontend Setup

```bash
# From the project root
cd frontend

# Install dependencies
npm install

# Create environment file and fill in your backend URL
cp .env.example .env

# Start React dev server
npm start
# App opens at http://localhost:3000
```

---

### Frontend `.env`

Create `frontend/.env`:

```env
# ── API URL ───────────────────────────────────────────────────────────
# Local development:
REACT_APP_API_URL=http://localhost:5000

# Production (replace with your Render URL after deploying the backend):
# REACT_APP_API_URL=https://your-backend-name.onrender.com
```

---

### First-Time Owner Account

The system enforces exactly one owner. Before logging into the dashboard, run the setup script once:

```bash
# From the backend/ directory
npm run setup
```

Default credentials created by the script:

| Field | Value |
|---|---|
| Email | `admin@shop.com` |
| Password | `admin123` |

> ⚠️ **Change the password immediately after first login.** The script refuses to run a second time if an owner already exists — this prevents accidental overwrites in production.

---

### Access URLs

**Local:**

| Interface | URL | Auth |
|---|---|---|
| Customer Kiosk | `http://localhost:3000/menu` | ❌ None |
| Checkout | `http://localhost:3000/checkout` | ❌ None |
| Owner Login | `http://localhost:3000/login` | — |
| Owner Dashboard | `http://localhost:3000/dashboard` | ✅ JWT |
| Backend API | `http://localhost:5000` | Varies |

**Production:**

| Interface | URL |
|---|---|
| Customer Kiosk | [https://inventorysystem-silk.vercel.app/menu](https://inventorysystem-silk.vercel.app/menu) |
| Owner Dashboard | [https://inventorysystem-silk.vercel.app](https://inventorysystem-silk.vercel.app) |

---

## 📡 API Reference

> **Protected routes** require a valid JWT in the `Authorization` header:
> ```
> Authorization: Bearer <token_from_login>
> ```

---

### 🔐 Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Owner login — returns JWT token | ❌ |

---

### 📋 Orders

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/orders` | Place order from kiosk. Stores `priceAtSale` per item. Returns token number. | ❌ |
| `GET` | `/api/orders` | Get all orders (all statuses) | ✅ |
| `PATCH` | `/api/orders/:id/done` | Move order Pending → Done | ✅ |
| `PATCH` | `/api/orders/:id/complete` | Complete order — deducts stock, records revenue | ✅ |
| `PATCH` | `/api/orders/:id/cancel` | Cancel order at any stage | ✅ |

---

### 🧁 Products

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/products` | All active (non-deleted) products | ❌ |
| `POST` | `/api/products` | Add product with Cloudinary image upload | ✅ |
| `GET` | `/api/products/deleted` | All soft-deleted products | ✅ |
| `PATCH` | `/api/products/:id/restore` | Restore soft-deleted product | ✅ |
| `PATCH` | `/api/products/:id/enable` | Enable product on kiosk | ✅ |
| `PATCH` | `/api/products/:id/disable` | Disable product from kiosk | ✅ |
| `DELETE` | `/api/products/:id` | Soft-delete product | ✅ |

---

### 📊 Stock

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/stock/today` | Today's stock quantities for all products | ❌ |
| `POST` | `/api/stock/update` | Set today's stock quantities (fresh daily entry) | ✅ |

---

### 💰 Product Prices

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/prices` | Set new price — closes old record, opens new | ✅ |
| `GET` | `/api/prices/current` | Current active price for all products | ✅ |
| `GET` | `/api/prices/:productId/history` | Full price history for one product | ✅ |

---

### 📈 Reports

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/reports/profit` | Daily profit: `?date=YYYY-MM-DD` | ✅ |
| `GET` | `/api/reports/profit/range` | Date-range profit: `?start=...&end=...` | ✅ |
| `GET` | `/api/reports/expense` | Daily expenses: `?date=YYYY-MM-DD` | ✅ |

---

### 👥 Customers

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/customers` | All customers grouped by phone with order history | ✅ |
| `GET` | `/api/customers/:phone` | Full order history for one phone number | ✅ |

---

### 🎂 Custom Orders

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/custom-orders` | Create custom order with advance payment | ✅ |
| `GET` | `/api/custom-orders` | Get all custom orders | ✅ |
| `PATCH` | `/api/custom-orders/:id/done` | Move to Done | ✅ |
| `PATCH` | `/api/custom-orders/:id/complete` | Complete custom order | ✅ |
| `PATCH` | `/api/custom-orders/:id/cancel` | Cancel custom order | ✅ |

---

### 🥦 Raw Materials

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/raw-materials` | Add material to catalogue | ✅ |
| `GET` | `/api/raw-materials` | All active raw materials | ✅ |
| `GET` | `/api/raw-materials/deleted` | Soft-deleted materials | ✅ |
| `PATCH` | `/api/raw-materials/:id/restore` | Restore deleted material | ✅ |
| `DELETE` | `/api/raw-materials/:id` | Soft-delete material | ✅ |

---

### 🛒 Raw Purchases

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/raw-purchases` | Log new purchase (status = Pending) | ✅ |
| `GET` | `/api/raw-purchases` | All logged purchases | ✅ |
| `PATCH` | `/api/raw-purchases/:id/done` | Confirm received → records as expense | ✅ |

---



---

## 🗄 Database Schema

```
┌──────────────────────────────────────────────────────┐
│  User                                                │
│  _id · email · password(bcrypt) · createdAt          │
└──────────────────────────────────────────────────────┘

                          
┌─────────────────────────▼────────────────────────────┐
│  Product                                             │
│  _id · name · category(ref) · imageUrl              │
│  cloudinaryId · isEnabled · isDeleted · createdAt   │
└──────────┬──────────────────────────┬────────────────┘
           │ ref                      │ ref
┌──────────▼──────────┐  ┌───────────▼──────────────┐
│  ProductPrice       │  │  StockEntry              │
│  _id                │  │  _id                     │
│  product(ref)       │  │  product(ref)            │
│  price              │  │  date                    │
│  fromDate           │  │  quantityAdded           │
│  toDate(null=active)│  │  quantityRemaining       │
└─────────────────────┘  └──────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Order                                               │
│  _id · customerName · customerPhone · tokenNumber   │
│  status (pending/done/completed/cancelled)          │
│  items: [{ product(ref), name, qty, priceAtSale }]  │
│  totalAmount · createdAt                            │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  CustomOrder                                         │
│  _id · customerName · customerPhone · description   │
│  status · totalPrice · advancePaid · balanceDue     │
│  createdAt                                          │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  RawMaterial                                         │
│  _id · name · unit · category · isDeleted · createdAt│
└─────────────────────────┬────────────────────────────┘
                          │ ref
┌─────────────────────────▼────────────────────────────┐
│  RawPurchase                                         │
│  _id · material(ref) · quantity · unitPrice         │
│  totalCost · purchaseDate                           │
│  status (pending/done) · createdAt                  │
└──────────────────────────────────────────────────────┘
```

---

## 🧠 Design Decisions

### 1. Single Owner Account — Enforced at Architecture Level

The system is designed for one bakery operator, not a multi-tenant SaaS product. Rather than building role management and team-access features that would triple complexity without any business value here, the architecture enforces a hard constraint: `setup.js` refuses to create a second owner account if one already exists, and the login endpoint only ever issues tokens against that single record. This keeps authentication down to a standard JWT flow with no refresh tokens, no session tables, and no permission checks beyond "is this a valid owner token." If the business grows to need a team, the only change required is adding a `role` field to the User schema and a single middleware check — the foundation is already correct.

### 2. Daily Stock Entries Instead of a Running Inventory Counter

Most inventory systems maintain a running counter and decrement it on every sale. A bakery does not work that way — croissants are baked fresh every morning in specific quantities, and yesterday's unsold stock is written off or repurposed, not carried forward. The system models this reality by requiring the owner to enter fresh quantities each morning. If the owner forgets to enter stock, no product is shown as available with a stale count from a previous day. This also makes the stock entry ritual meaningful — it is the owner's daily signal to the system about what is available today, not a ledger correction.

### 3. Price History as Immutable Append-Only Records

When a price changes, the system closes the current `ProductPrice` record by setting its `toDate` to today, then creates a new record with `fromDate` set to today and `toDate` as `null` (signalling "currently active"). The old record is never updated or deleted. This means the full pricing timeline for every product is always queryable — you can find exactly what a product cost on any date in the past. It provides an automatic audit trail, makes the `priceAtSale` pattern reliable (below), and costs virtually nothing in storage since price changes are infrequent relative to orders.

### 4. `priceAtSale` Stored Directly on Every Order Line Item

When an order is placed, the backend looks up the currently active price for each product and stores it directly on the order document as `priceAtSale`. This makes every order a self-contained financial record — it knows what was sold, how many units, and exactly what was charged at that moment in time. Without this, any profit calculation for a past period would silently recalculate using today's prices rather than the prices actually charged, making historical reports unreliable. This is standard practice in every serious commerce system and is just as important for a small bakery as it is for a large e-commerce platform.

### 5. Soft Delete for Products and Raw Materials

Deleting a product or raw material sets an `isDeleted: true` flag rather than removing the document. This is essential for referential integrity: every `Order` references product IDs in its line items, and every `RawPurchase` references a raw material ID. A hard delete would orphan those references and make historical records unreadable. Soft delete preserves the full history, allows the owner to restore an item deleted by mistake, and costs nothing in query performance because all normal listing queries simply filter on `isDeleted: false`. The dedicated Deleted Products and Deleted Raw Materials pages give the owner complete visibility and control.

---


### 6.Everything is Mobile Friendl

Everyting can be controlled in the mobile itself.so this is the biggest advantage. assuming  owner doesnt know any technical knowledge, this website is made for them.
## 👤 Author

**SALADI VISHNU VARDHAN** — Full-stack developer · IIIT ALLAHABAD 

Built this system to solve a real operational problem: replacing the paper-and-shouting workflow of a busy bakery counter with a clean digital kiosk and owner dashboard — from customer token to end-of-day profit report.

[![GitHub](https://img.shields.io/badge/GitHub-iit2023271-181717?style=flat-square&logo=github)](https://github.com/iit2023271)
[![Live Demo](https://img.shields.io/badge/Live%20Kiosk-Demo-brightgreen?style=flat-square&logo=vercel)](https://inventorysystem-silk.vercel.app/menu)

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 iit2023271

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

<div align="center">

Made with ☕, flour, and way too many `console.log` statements.

**⭐ Star this repo if it helped you — it takes one click and means a lot.**

[🔗 Live Kiosk](https://inventorysystem-silk.vercel.app/menu) · [🔗 Owner Dashboard](https://inventorysystem-silk.vercel.app) · [🔗 GitHub](https://github.com/iit2023271/INVENTORYSYSTEM)

</div>