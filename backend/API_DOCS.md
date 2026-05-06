# API Documentation

## Authentication Endpoints

### 1. Register Clinic

**Endpoint:** `POST /v1/auth/register/clinic`

**Description:** Register a new clinic with gated eligibility checks.

**Request:**
```json
{
  "eligibilityGate": {
    "isUSAClinic": true,
    "clinicType": "KETAMINE"
  },
  "clinic": {
    "name": "Bright Infusion Clinic",
    "npiNumber": "1234567890",
    "taxId": "12-3456789",
    "stateLicenseNumber": "IL-12345",
    "address": "123 Medical Blvd",
    "city": "Chicago",
    "state": "IL",
    "zipCode": "60601",
    "primaryPhone": "312-555-0000",
    "workEmail": "admin@brightinfusion.com",
    "infusionChairCount": 8,
    "treatmentTypesOffered": ["KETAMINE", "IV_THERAPY"]
  },
  "admin": {
    "firstName": "John",
    "lastName": "Admin",
    "password": "SecurePassword123!",
    "role": "CLINIC_ADMIN"
  }
}
```

**Response (201):**
```json
{
  "clinicId": "clinic_xyz",
  "temporaryToken": "jwt_token",
  "nextStep": "VERIFY_EMAIL",
  "userId": "user_xyz"
}
```

**Errors:**
- 400: Invalid input data
- 409: Clinic with this NPI or email already exists

---

### 2. Verify Email

**Endpoint:** `POST /v1/auth/register/verify-email`

**Description:** Verify work email address.

**Headers:**
```
Authorization: Bearer <temporaryToken>
```

**Request:**
```json
{
  "email": "admin@brightinfusion.com",
  "verificationCode": "123456"
}
```

**Response (200):**
```json
{
  "clinicId": "clinic_xyz",
  "status": "EMAIL_VERIFIED",
  "nextStep": "SIGN_BAA"
}
```

**Errors:**
- 400: Invalid verification code
- 401: Invalid or expired token
- 404: User not found

---

### 3. Sign BAA Agreement

**Endpoint:** `POST /v1/auth/register/sign-baa`

**Description:** Digitally sign HIPAA Business Associate Agreement.

**Headers:**
```
Authorization: Bearer <temporaryToken>
```

**Request:**
```json
{
  "email": "admin@brightinfusion.com",
  "signatureData": "base64_signature_data",
  "adminName": "John Admin",
  "adminTitle": "Clinic Manager"
}
```

**Response (200):**
```json
{
  "clinicId": "clinic_xyz",
  "status": "ACTIVE",
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": {
    "id": "user_xyz",
    "email": "admin@brightinfusion.com",
    "firstName": "John",
    "lastName": "Admin",
    "role": "CLINIC_ADMIN"
  }
}
```

---

### 4. Login

**Endpoint:** `POST /v1/auth/login`

**Description:** Staff login with email and password.

**Request:**
```json
{
  "email": "staff@clinic.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "userId": "user_xyz",
  "clinicId": "clinic_xyz",
  "role": "CLINIC_STAFF",
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "expiresIn": 3600,
  "user": {
    "id": "user_xyz",
    "email": "staff@clinic.com",
    "firstName": "Staff",
    "lastName": "Member",
    "role": "CLINIC_STAFF"
  }
}
```

**Errors:**
- 400: Invalid input
- 401: Invalid email or password
- 401: Account is not active

---

### 5. Forgot Password

**Endpoint:** `POST /v1/auth/password/forgot`

**Description:** Request password reset email.

**Request:**
```json
{
  "email": "staff@clinic.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset link sent to email"
}
```

**Note:** Returns same message regardless of whether email exists (for security).

---

### 6. Reset Password

**Endpoint:** `POST /v1/auth/password/reset`

**Description:** Reset password with token from email.

**Request:**
```json
{
  "resetToken": "jwt_reset_token_from_email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200):**
```json
{
  "message": "Password reset successful"
}
```

**Errors:**
- 400: Invalid password
- 401: Invalid or expired reset token

---

### 7. Get Current User

**Endpoint:** `GET /v1/auth/me`

**Description:** Get current authenticated user's information.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "id": "user_xyz",
  "email": "staff@clinic.com",
  "firstName": "Staff",
  "lastName": "Member",
  "role": "CLINIC_STAFF",
  "status": "ACTIVE",
  "clinicId": "clinic_xyz"
}
```

**Errors:**
- 401: Missing or invalid token
- 404: User not found

---

### 8. Logout

**Endpoint:** `POST /v1/auth/logout`

**Description:** Logout user.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Clinic Management Endpoints

### 9. Get Clinic Details

**Endpoint:** `GET /v1/clinics/{clinicId}`

**Description:** Get clinic details and information.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "id": "clinic_xyz",
  "name": "Bright Infusion Clinic",
  "clinicType": "KETAMINE",
  "npiNumber": "1234567890",
  "taxId": "12-3456789",
  "streetAddress": "123 Medical Blvd",
  "city": "Chicago",
  "state": "IL",
  "zipCode": "60601",
  "primaryPhone": "312-555-0000",
  "workEmail": "admin@brightinfusion.com",
  "infusionChairCount": 8,
  "treatmentTypesOffered": ["KETAMINE", "IV_THERAPY"],
  "status": "ACTIVE",
  "activatedAt": "2026-01-15T10:00:00Z",
  "createdAt": "2026-01-10T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

**Errors:**
- 401: Unauthorized
- 403: Access denied
- 404: Clinic not found

---

### 10. Update Clinic Information

**Endpoint:** `PUT /v1/clinics/{clinicId}`

**Description:** Update clinic information. (Clinic Admin only)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "name": "Updated Clinic Name",
  "primaryPhone": "312-555-1111",
  "infusionChairCount": 10
}
```

**Response (200):** Updated clinic object

**Errors:**
- 400: Invalid input
- 401: Unauthorized
- 403: Only clinic admin can update

---

### 11. Get Clinic Staff

**Endpoint:** `GET /v1/clinics/{clinicId}/staff`

**Description:** List all staff members for clinic.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
[
  {
    "id": "user_1",
    "email": "staff@clinic.com",
    "firstName": "Staff",
    "lastName": "Member",
    "role": "CLINIC_STAFF",
    "status": "ACTIVE",
    "createdAt": "2026-01-10T10:00:00Z"
  }
]
```

**Errors:**
- 401: Unauthorized
- 403: Access denied

---

### 12. Add Staff Member

**Endpoint:** `POST /v1/clinics/{clinicId}/staff`

**Description:** Add new staff member to clinic. (Clinic Admin only)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "email": "newstaff@clinic.com",
  "firstName": "New",
  "lastName": "Staff",
  "role": "CLINIC_STAFF"
}
```

**Response (201):**
```json
{
  "id": "user_new",
  "email": "newstaff@clinic.com",
  "firstName": "New",
  "lastName": "Staff",
  "role": "CLINIC_STAFF",
  "status": "ACTIVE"
}
```

**Errors:**
- 400: Invalid input
- 401: Unauthorized
- 403: Only clinic admin can add staff
- 409: User with this email already exists

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong",
  "statusCode": 400
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input or validation error
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Authenticated but not authorized for this action
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **500 Internal Server Error**: Server error

---

## Authentication

Most endpoints require authentication via JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

### Token Types

1. **Access Token**: Used for API calls. Expires in 1 hour (3600 seconds).
2. **Refresh Token**: Used to get a new access token. Expires in 7 days.
3. **Temporary Token**: Used during registration (10 minutes).

---

## Rate Limiting

Rate limiting is not yet implemented but will be added soon.

---

## CORS

CORS is enabled for the frontend URL specified in the environment variable `FRONTEND_URL`.

---

## Health Check

**Endpoint:** `GET /health`

**Response (200):**
```json
{
  "status": "ok"
}
```
