import { prisma } from '../config/db';
import { ProfileTool } from '../tools/profile.tool';

export class ProfileService {
  static async getProfile(userId: string) {
    return ProfileTool.getUserProfile(userId);
  }

  static async updateProfile(userId: string, data: any) {
    const { age, gender, heightCm, weightKg, targetWeightKg, fitnessLevel, workoutFrequencyDays, preferredDurationMin, availableEquipment, preferredTime } = data;

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(age && { age: Number(age) }),
        ...(gender && { gender }),
        ...(heightCm && { heightCm: Number(heightCm) }),
        ...(weightKg && { weightKg: Number(weightKg) }),
        ...(targetWeightKg !== undefined && { targetWeightKg: targetWeightKg ? Number(targetWeightKg) : null }),
        ...(fitnessLevel && { fitnessLevel }),
        ...(workoutFrequencyDays && { workoutFrequencyDays: Number(workoutFrequencyDays) }),
        ...(preferredDurationMin && { preferredDurationMin: Number(preferredDurationMin) }),
        ...(availableEquipment && { availableEquipment }),
        ...(preferredTime && { preferredTime }),
      },
      create: {
        userId,
        age: age ? Number(age) : 25,
        gender: gender || 'PREFER_NOT_TO_SAY',
        heightCm: heightCm ? Number(heightCm) : 175,
        weightKg: weightKg ? Number(weightKg) : 70,
        targetWeightKg: targetWeightKg ? Number(targetWeightKg) : null,
        fitnessLevel: fitnessLevel || 'BEGINNER',
        workoutFrequencyDays: workoutFrequencyDays ? Number(workoutFrequencyDays) : 4,
        preferredDurationMin: preferredDurationMin ? Number(preferredDurationMin) : 45,
        availableEquipment: availableEquipment || 'FULL_GYM',
        preferredTime: preferredTime || 'Morning',
      },
    });

    if (weightKg) {
      await prisma.bodyMeasurement.create({
        data: {
          userId,
          weightKg: Number(weightKg),
        },
      });
    }

    return profile;
  }
}
