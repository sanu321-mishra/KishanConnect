KishanConnect is an Angular + Node.js full-stack web application designed to provide authenticated farmers with 
crop-management functionality, with a backend API, database layer, and payment integration groundwork.

👤 User registration
🔐 User login/logout
🪪 JWT-based authentication
🌱 Crop management
📋 Crop listing
➕ Adding crops
🔒 Protected crop-management routes
📱 Responsive/mobile-friendly UI
💳 Payment integration documentation
----------------------------------------------------------------------
KishanConnect
│
├── kisanConnectFE
│   └── Angular Frontend
│
├── KisanConnectbackend
│   └── Node.js Backend / REST API
│
└── PAYMENT_INTEGRATION_README.md
-----------------------------------------------------------------------
             FARMER
                │
                ▼
       ┌─────────────────┐
       │ Angular Frontend │
       │   KishanConnect  │
       └────────┬────────┘
                │
        HTTP / REST API
                │
                ▼
       ┌─────────────────┐
       │ Node.js Backend  │
       │ Authentication   │
       │ Crop APIs        │
       └────────┬────────┘
                │
                ▼
             Database
