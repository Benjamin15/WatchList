-- CreateTable
CREATE TABLE "votes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "room_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" DATETIME
);

-- CreateTable
CREATE TABLE "vote_options" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vote_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vote_options_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "votes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "vote_options_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vote_results" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vote_id" INTEGER NOT NULL,
    "option_id" INTEGER NOT NULL,
    "voter_name" TEXT,
    "device_id" TEXT,
    "voted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vote_results_vote_id_fkey" FOREIGN KEY ("vote_id") REFERENCES "votes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "vote_results_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "vote_options" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
