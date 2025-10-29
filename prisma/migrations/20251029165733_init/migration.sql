-- CreateTable
CREATE TABLE "Idempotency" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastResultId" TEXT
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ts" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flow" TEXT NOT NULL,
    "objectType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "externalId" TEXT,
    "fingerprint" TEXT,
    "payloadHash" TEXT,
    "httpStatus" INTEGER,
    "resultId" TEXT,
    "durationMs" INTEGER
);

-- CreateTable
CREATE TABLE "DLQ" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ts" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceSystem" TEXT NOT NULL,
    "targetSystem" TEXT NOT NULL,
    "objectType" TEXT NOT NULL,
    "externalId" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "payloadJson" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "replayStatus" TEXT NOT NULL DEFAULT 'PENDING'
);

-- CreateTable
CREATE TABLE "Cursor" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Mapping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chargeType" TEXT NOT NULL,
    "qboAccountId" TEXT,
    "qboItemId" TEXT,
    "classId" TEXT,
    "locationId" TEXT,
    "taxCode" TEXT,
    "memoTemplate" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Property" (
    "propertyId" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT,
    "locationId" TEXT,
    "bankAccountId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "OAuthToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "realmId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
