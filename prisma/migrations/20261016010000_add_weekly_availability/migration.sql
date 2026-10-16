CREATE TABLE "WeeklyAvailability" (
    "weekday" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT NOT NULL DEFAULT '08:00',
    "endTime" TEXT NOT NULL DEFAULT '18:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyAvailability_pkey" PRIMARY KEY ("weekday")
);

INSERT INTO "WeeklyAvailability" ("weekday", "isOpen", "startTime", "endTime", "updatedAt")
SELECT weekday, true, '08:00', '18:00', CURRENT_TIMESTAMP
FROM generate_series(0, 6) AS weekday;
