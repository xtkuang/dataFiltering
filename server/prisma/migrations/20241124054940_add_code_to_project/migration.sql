/*
  Warnings:

  - You are about to drop the column `classify` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `classify` on the `Project` table. All the data in the column will be lost.
  - Added the required column `code` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelNumber` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestNumber` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Workstation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Equipment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Equipment" ("createdAt", "id", "name", "projectId", "type", "updatedAt") SELECT "createdAt", "id", "name", "projectId", "type", "updatedAt" FROM "Equipment";
DROP TABLE "Equipment";
ALTER TABLE "new_Equipment" RENAME TO "Equipment";
CREATE TABLE "new_Material" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "modelNumber" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "lowestPrice" REAL NOT NULL,
    "highestPrice" REAL NOT NULL,
    "averagePrice" REAL NOT NULL,
    "workstationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Material_workstationId_fkey" FOREIGN KEY ("workstationId") REFERENCES "Workstation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Material" ("averagePrice", "brand", "code", "createdAt", "highestPrice", "id", "lowestPrice", "name", "updatedAt", "workstationId") SELECT "averagePrice", "brand", "code", "createdAt", "highestPrice", "id", "lowestPrice", "name", "updatedAt", "workstationId" FROM "Material";
DROP TABLE "Material";
ALTER TABLE "new_Material" RENAME TO "Material";
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("createdAt", "id", "name", "updatedAt") SELECT "createdAt", "id", "name", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");
CREATE TABLE "new_Workstation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "designHours" INTEGER NOT NULL,
    "electHours" INTEGER NOT NULL,
    "assemblyHours" INTEGER NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Workstation_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Workstation" ("assemblyHours", "createdAt", "designHours", "electHours", "equipmentId", "id", "name", "type", "updatedAt") SELECT "assemblyHours", "createdAt", "designHours", "electHours", "equipmentId", "id", "name", "type", "updatedAt" FROM "Workstation";
DROP TABLE "Workstation";
ALTER TABLE "new_Workstation" RENAME TO "Workstation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
