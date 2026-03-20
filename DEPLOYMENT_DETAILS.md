# 🌐 Deployment & Environment Configuration: Matrimonial Platform

This document outlines the deployment strategy, environment details, and live application URLs for the Matrimonial Platform (Mobile & Web).

---

## 💻 Matrimonial-Web-App (Production)

**Environment**: Production (Vercel / Docker)
**Application URL**: [https://matrimonial.ostechnologies.info](https://matrimonial.ostechnologies.info)
**Admin Dashboard**: [https://matrimonial.ostechnologies.info/admin](https://matrimonial.ostechnologies.info/admin) (Coming Soon)

### Deployment Configuration:
- **Framework**: Next.js 16 (App Router)
- **Runtime**: Node.js 20.x
- **Build Command**: `npm run build`
- **Output**: Optimized static assets + server-side routes
- **Containerization**: Docker & Docker Compose
  - **Dockerfile**: Optimized multi-stage build for production.
  - **Docker Compose**: Orchestrates Next.js app and local dependencies.

### Environment Variables:
| Variable | Description |
|:---|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API endpoint |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key for client-side access |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret service role key for server-side operations |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public Razorpay key for checkout initialization |
| `RAZORPAY_KEY_ID` | Private Razorpay key for API verification |

---

## 📱 Matrimonial-Mobile_App (Release)

**Platform**: Android & iOS
**Store URLs**:
- **Google Play Store**: [Link to your app on Play Store]
- **Apple App Store**: [Link to your app on App Store]

### Build Configuration:
- **Framework**: Flutter (SDK ^3.6.0)
- **Android**: Target SDK 34, Min SDK 21
- **iOS**: Target Version 13.0
- **Signing**: Release signing configured via `.jks` (Android) and Provisioning Profiles (iOS).

### Release Process:
1. **Android**: `flutter build apk --release` / `flutter build appbundle`
2. **iOS**: `flutter build ipa`

---

## 🗄 Shared Backend (Supabase)

**Project Reference**: `bobdtpdnbzflfebchipb`
**Region**: `aws-0-us-east-1` (AWS North Virginia)
**Database URL**: `postgres://postgres.bobdtpdnbzflfebchipb:KWmDZZyUEKX0quEy@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

### Key Services Used:
- **Authentication**: Email/Password + Social Login (configured for both apps).
- **PostgreSQL**: Central database with Row Level Security (RLS).
- **Storage Buckets**:
  - `profiles`: Stores user-uploaded photos and horoscope documents.
- **Edge Functions**: (If applicable) Used for backend logic like Razorpay webhook verification.

---

## 🔄 CI/CD Pipeline

**Platform**: GitHub Actions (Configured in `.github/workflows/`)
- **Web App**: Automatic deployment to Vercel on push to `main` branch.
- **Mobile App**: Automated testing and build generation (APK/IPA) on release tags.

---

## 🛡 Security & Compliance

- **SSL/TLS**: All traffic encrypted via HTTPS.
- **RLS Policies**: Strict database access controls ensuring users can only view/edit their own data.
- **JWT Authentication**: Short-lived tokens with refresh logic for secure sessions.
- **Payment Security**: Razorpay PCI-DSS compliant checkout.
