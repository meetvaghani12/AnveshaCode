# Tutorial: AnveshaCode

AnveshaCode is an **AI-powered platform** providing *automated code reviews*. It enables users to submit code, receive detailed analysis, quality scores, and identified issues. The project features a comprehensive **user authentication and authorization system**, a robust **payment and subscription management** with Stripe integration, and in-depth **analytics** to track review activity. Its core purpose is to help developers improve their code quality and understand their coding habits effectively.


## Visual Overview

```mermaid
flowchart TD
    A0["User Authentication & Authorization
"]
    A1["Database Management with Prisma
"]
    A2["AI Code Review Core
"]
    A3["Payment & Subscription System
"]
    A4["Frontend UI Component Library
"]
    A5["Backend API Layer
"]
    A6["Analytics & Reporting
"]
    A7["Email & OTP Communication
"]
    A8["Frontend Utilities & Hooks
"]
    A9["Subscription & Review Limits
"]
    A0 -- "Manages user data" --> A1
    A0 -- "Triggers emails" --> A7
    A0 -- "Exposes auth endpoints" --> A5
    A4 -- "Provides auth UI" --> A0
    A8 -- "Enhances UI" --> A4
    A8 -- "Supports auth flow" --> A0
    A2 -- "Persists reviews" --> A1
    A2 -- "Checks limits" --> A9
    A2 -- "Provides service via" --> A5
    A3 -- "Manages subscriptions" --> A1
    A3 -- "Authenticates users" --> A0
    A3 -- "Processes payments via" --> A5
    A3 -- "Defines plans for" --> A9
    A6 -- "Queries data from" --> A1
    A6 -- "Provides data via" --> A5
    A4 -- "Renders review UI" --> A2
    A4 -- "Displays pricing UI" --> A3
    A4 -- "Visualizes reports" --> A6
    A8 -- "Supports review UI" --> A2
    A8 -- "Supports pricing UI" --> A3
    A8 -- "Supports analytics UI" --> A6
    A9 -- "Fetches user plans" --> A1
```

## Chapters

1. [AI Code Review Core
](01_ai_code_review_core_.md)
2. [User Authentication & Authorization
](02_user_authentication___authorization_.md)
3. [Database Management with Prisma
](03_database_management_with_prisma_.md)
4. [Payment & Subscription System
](04_payment___subscription_system_.md)
5. [Subscription & Review Limits
](05_subscription___review_limits_.md)
6. [Backend API Layer
](06_backend_api_layer_.md)
7. [Frontend UI Component Library
](07_frontend_ui_component_library_.md)
8. [Email & OTP Communication
](08_email___otp_communication_.md)
9. [Analytics & Reporting
](09_analytics___reporting_.md)
10. [Frontend Utilities & Hooks
](10_frontend_utilities___hooks_.md)

---