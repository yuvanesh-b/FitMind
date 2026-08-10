-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `refresh_token_hash` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `age` INTEGER NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') NOT NULL DEFAULT 'PREFER_NOT_TO_SAY',
    `height_cm` DOUBLE NOT NULL,
    `weight_kg` DOUBLE NOT NULL,
    `target_weight_kg` DOUBLE NULL,
    `fitness_level` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'BEGINNER',
    `workout_frequency_days` INTEGER NOT NULL DEFAULT 4,
    `preferred_duration_min` INTEGER NOT NULL DEFAULT 45,
    `available_equipment` ENUM('BODYWEIGHT', 'DUMBBELL', 'BARBELL', 'CABLE', 'MACHINE', 'RESISTANCE_BAND', 'KETTLEBELL', 'FULL_GYM') NOT NULL DEFAULT 'FULL_GYM',
    `preferred_time` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_profiles_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fitness_goals` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `category` ENUM('WEIGHT_LOSS', 'MUSCLE_GAIN', 'STRENGTH', 'ENDURANCE', 'GENERAL_FITNESS') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `target_value` DOUBLE NULL,
    `unit` VARCHAR(191) NULL,
    `target_date` DATETIME(3) NULL,
    `is_completed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercises` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `muscle_group` ENUM('CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'CORE', 'CARDIO', 'FULL_BODY') NOT NULL,
    `equipment` ENUM('BODYWEIGHT', 'DUMBBELL', 'BARBELL', 'CABLE', 'MACHINE', 'RESISTANCE_BAND', 'KETTLEBELL', 'FULL_GYM') NOT NULL,
    `difficulty` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') NOT NULL DEFAULT 'BEGINNER',
    `description` TEXT NOT NULL,
    `instructions` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `exercises_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_plans` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `is_ai_generated` BOOLEAN NOT NULL DEFAULT false,
    `is_custom` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_plan_days` (
    `id` VARCHAR(191) NOT NULL,
    `plan_id` VARCHAR(191) NOT NULL,
    `day_name` VARCHAR(191) NOT NULL,
    `day_order` INTEGER NOT NULL,
    `target_muscles` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_plan_exercises` (
    `id` VARCHAR(191) NOT NULL,
    `day_id` VARCHAR(191) NOT NULL,
    `exercise_id` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `target_sets` INTEGER NOT NULL DEFAULT 3,
    `target_reps` INTEGER NOT NULL DEFAULT 10,
    `rest_seconds` INTEGER NOT NULL DEFAULT 60,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `plan_id` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `status` ENUM('IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'IN_PROGRESS',
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,
    `duration_seconds` INTEGER NOT NULL DEFAULT 0,
    `total_volume_kg` DOUBLE NOT NULL DEFAULT 0,
    `total_sets` INTEGER NOT NULL DEFAULT 0,
    `total_reps` INTEGER NOT NULL DEFAULT 0,
    `calories_burned` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_session_exercises` (
    `id` VARCHAR(191) NOT NULL,
    `session_id` VARCHAR(191) NOT NULL,
    `exercise_id` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workout_sets` (
    `id` VARCHAR(191) NOT NULL,
    `session_exercise_id` VARCHAR(191) NOT NULL,
    `set_number` INTEGER NOT NULL,
    `weight_kg` DOUBLE NOT NULL DEFAULT 0,
    `reps` INTEGER NOT NULL DEFAULT 0,
    `is_completed` BOOLEAN NOT NULL DEFAULT true,
    `previous_weight_kg` DOUBLE NULL,
    `previous_reps` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `body_measurements` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `weight_kg` DOUBLE NOT NULL,
    `chest_cm` DOUBLE NULL,
    `waist_cm` DOUBLE NULL,
    `arms_cm` DOUBLE NULL,
    `thighs_cm` DOUBLE NULL,
    `body_fat_percentage` DOUBLE NULL,
    `recorded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nutrition_logs` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `meal_type` VARCHAR(191) NOT NULL,
    `food_name` VARCHAR(191) NOT NULL,
    `quantity` VARCHAR(191) NOT NULL DEFAULT '1 serving',
    `calories` INTEGER NOT NULL DEFAULT 0,
    `protein_g` DOUBLE NOT NULL DEFAULT 0,
    `carbs_g` DOUBLE NOT NULL DEFAULT 0,
    `fat_g` DOUBLE NOT NULL DEFAULT 0,
    `logged_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_conversations` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'Coaching Session',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_messages` (
    `id` VARCHAR(191) NOT NULL,
    `conversation_id` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ASSISTANT', 'SYSTEM') NOT NULL,
    `content` TEXT NOT NULL,
    `structured_data` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_recommendations` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `content_json` TEXT NOT NULL,
    `is_dismissed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progress_records` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `weight_kg` DOUBLE NULL,
    `total_volume_kg` DOUBLE NOT NULL DEFAULT 0,
    `completed_workouts` INTEGER NOT NULL DEFAULT 0,
    `streak_days` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_activity` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `workouts_done` INTEGER NOT NULL DEFAULT 0,
    `calories_burned` INTEGER NOT NULL DEFAULT 0,
    `active_minutes` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fitness_goals` ADD CONSTRAINT `fitness_goals_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_plans` ADD CONSTRAINT `workout_plans_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_plan_days` ADD CONSTRAINT `workout_plan_days_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `workout_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_plan_exercises` ADD CONSTRAINT `workout_plan_exercises_day_id_fkey` FOREIGN KEY (`day_id`) REFERENCES `workout_plan_days`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_plan_exercises` ADD CONSTRAINT `workout_plan_exercises_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_sessions` ADD CONSTRAINT `workout_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_sessions` ADD CONSTRAINT `workout_sessions_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `workout_plans`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_session_exercises` ADD CONSTRAINT `workout_session_exercises_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `workout_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_session_exercises` ADD CONSTRAINT `workout_session_exercises_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workout_sets` ADD CONSTRAINT `workout_sets_session_exercise_id_fkey` FOREIGN KEY (`session_exercise_id`) REFERENCES `workout_session_exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `body_measurements` ADD CONSTRAINT `body_measurements_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nutrition_logs` ADD CONSTRAINT `nutrition_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_conversations` ADD CONSTRAINT `ai_conversations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_messages` ADD CONSTRAINT `ai_messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ai_recommendations` ADD CONSTRAINT `ai_recommendations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progress_records` ADD CONSTRAINT `progress_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `daily_activity` ADD CONSTRAINT `daily_activity_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
