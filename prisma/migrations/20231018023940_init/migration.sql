-- CreateTable
CREATE TABLE "droppers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pseudonym" STRING NOT NULL DEFAULT 'Anonymous',
    "emoji" STRING NOT NULL DEFAULT '👻',
    "creatd_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "droppers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emoji_drops" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "emoji" STRING NOT NULL,
    "dropped_by" UUID NOT NULL,
    "ua_browser_name" STRING,
    "ua_browser_version" STRING,
    "ua_device_type" STRING,
    "ua_device_vendor" STRING,
    "ua_device_model" STRING,
    "ua_os_name" STRING,
    "ua_os_version" STRING,
    "creatd_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emoji_drops_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "emoji_drops" ADD CONSTRAINT "emoji_drops_dropped_by_fkey" FOREIGN KEY ("dropped_by") REFERENCES "droppers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
