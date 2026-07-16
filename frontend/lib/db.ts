import { prisma } from "./prisma";
import { cache } from "react";
import type {
  ConsultationStatus,
  Gender,
  BloodType,
  Prisma,
} from "@prisma/client";

// ============================================
// TYPE HELPERS
// ============================================

// For optional JSON fields (omit if undefined)
type JsonOptional = Prisma.InputJsonValue | undefined;

// For required JSON fields
type JsonRequired = Prisma.InputJsonValue;

// Helper to clean undefined values while preserving type safety
function cleanUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  ) as T;
}

// ============================================
// SERVER-ONLY DATABASE FUNCTIONS
// ============================================

export const db = {
  // ============================================
  // USER FUNCTIONS
  // ============================================
  getUserById: cache(async (id: string) => {
    return prisma.user.findUnique({
      where: { id },
      include: {
        patients: true,
        consultations: true,
      },
    });
  }),

  getUserByEmail: cache(async (email: string) => {
    return prisma.user.findUnique({
      where: { email },
    });
  }),

  updateUser: async (
    id: string,
    data: {
      name: string;
      email: string;
      specialty?: string | null;
      phone?: string | null;
    },
  ) => {
    return prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        specialty: data.specialty,
        phone: data.phone,
      },
    });
  },

  // ============================================
  // PATIENT FUNCTIONS
  // ============================================
  getPatients: cache(
    async (userId: string, includeArchived: boolean = false) => {
      return prisma.patient.findMany({
        where: {
          userId,
          isArchived: includeArchived ? undefined : false,
          deletedAt: null,
        },
        include: {
          consultations: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy: { createdAt: "desc" },
      });
    },
  ),

  getPatientById: cache(async (id: string, userId: string) => {
    return prisma.patient.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        consultations: {
          orderBy: { createdAt: "desc" },
          take: 10, // Limit to last 10 consultations
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
    });
  }),

  createPatient: async (data: {
    userId: string;
    name: string;
    age?: number;
    gender?: Gender;
    bloodType?: BloodType;
    phone?: string;
    email?: string;
    address?: string;
    allergies?: string;
    chronicConditions?: string[];
    medications?: string[];
    medicalHistory?: JsonOptional;
  }) => {
    const { userId, name, ...optional } = data;

    return prisma.patient.create({
      data: {
        doctor: { connect: { id: userId } },
        name,
        bloodType: data.bloodType || "UNKNOWN",
        chronicConditions: data.chronicConditions || [],
        medications: data.medications || [],
        ...cleanUndefined(optional),
      },
    });
  },

  updatePatient: async (
    id: string,
    userId: string,
    data: Prisma.PatientUpdateInput,
  ) => {
    return prisma.patient.updateMany({
      where: { id, userId, deletedAt: null },
      data,
    });
  },

  archivePatient: async (id: string, userId: string) => {
    return prisma.patient.updateMany({
      where: { id, userId },
      data: { isArchived: true },
    });
  },

  // ============================================
  // SEARCH & PAGINATION FUNCTIONS
  // ============================================

  searchPatients: cache(
    async ({
      userId,
      search,
      page = 1,
      pageSize = 10,
      includeArchived = false,
    }: {
      userId: string;
      search?: string;
      page?: number;
      pageSize?: number;
      includeArchived?: boolean;
    }) => {
      const skip = (page - 1) * pageSize;
      const where = {
        userId,
        isArchived: includeArchived ? undefined : false,
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const [items, total] = await Promise.all([
        prisma.patient.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
          include: {
            consultations: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        }),
        prisma.patient.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    },
  ),

  // ============================================
  // CONSULTATION FUNCTIONS
  // ============================================
  getConsultations: cache(async (userId: string, patientId?: string) => {
    return prisma.consultation.findMany({
      where: {
        doctorId: userId,
        ...(patientId && { patientId }),
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            gender: true,
            age: true,
          },
        },
        feedback: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getConsultationById: cache(async (id: string, doctorId: string) => {
    return prisma.consultation.findFirst({
      where: { id, doctorId },
      include: {
        patient: true,
        feedback: true,
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
      },
    });
  }),

  createConsultation: async (data: {
    patientId: string;
    doctorId: string;
    symptoms: number[]; // 132-length array of 0/1
    selectedSymptoms?: string[];
    symptomNames?: string[];
    predictedDisease?: string;
    confidence?: number;
    topPredictions?: Array<{ condition: string; probability: number }>;
    explanation?: Prisma.InputJsonValue;
    isEmergency?: boolean;
    emergencySymptoms?: string[];
    status?: ConsultationStatus;
    createdBy?: string;
  }) => {
    const { patientId, doctorId, symptoms, ...optional } = data;

    return prisma.consultation.create({
      data: {
        patient: { connect: { id: patientId } },
        doctor: { connect: { id: doctorId } },
        symptoms: symptoms as Prisma.InputJsonValue,
        status: data.status || "PENDING",
        emergencySymptoms: data.emergencySymptoms || [],
        ...cleanUndefined(optional),
      },
    });
  },

  updateConsultation: async (
    id: string,
    doctorId: string,
    data: Prisma.ConsultationUpdateInput,
  ) => {
    return prisma.consultation.updateMany({
      where: { id, doctorId },
      data,
    });
  },

  // ============================================
  // FEEDBACK FUNCTIONS
  // ============================================
  createFeedback: async (data: {
    consultationId: string;
    doctorId: string;
    wasCorrect: boolean;
    actualDisease: string;
    confidenceRating?: number;
    comments?: string;
    symptoms?: JsonOptional;
  }) => {
    const { consultationId, doctorId, wasCorrect, actualDisease, ...optional } =
      data;

    return prisma.feedback.create({
      data: {
        consultation: { connect: { id: consultationId } },
        doctor: { connect: { id: doctorId } },
        wasCorrect,
        actualDisease,
        ...cleanUndefined(optional),
      },
    });
  },

  getFeedbackForRetraining: cache(async (limit: number = 100) => {
    return prisma.feedback.findMany({
      where: {
        usedForRetraining: false,
        wasCorrect: false,
      },
      include: {
        consultation: true,
      },
      take: limit,
      orderBy: { createdAt: "asc" },
    });
  }),

  markFeedbackRetrained: async (ids: string[]) => {
    return prisma.feedback.updateMany({
      where: { id: { in: ids } },
      data: {
        usedForRetraining: true,
        retrainedAt: new Date(),
      },
    });
  },

  getFeedbackByConsultationId: cache(async (consultationId: string) => {
    return prisma.feedback.findUnique({
      where: { consultationId },
    });
  }),

  updateFeedback: async (
    feedbackId: string,
    data: {
      wasCorrect: boolean;
      actualDisease: string;
      confidenceRating?: number;
      comments?: string;
    },
  ) => {
    return prisma.feedback.update({
      where: { id: feedbackId },
      data,
    });
  },

  // ============================================
  // AUDIT LOG FUNCTIONS
  // ============================================
  createAuditLog: async (data: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes?: JsonOptional;
    ipAddress?: string;
    userAgent?: string;
  }) => {
    const { userId, action, entityType, entityId, ...optional } = data;

    return prisma.auditLog.create({
      data: {
        user: { connect: { id: userId } },
        action,
        entityType,
        entityId,
        ...cleanUndefined(optional),
      },
    });
  },

  // ============================================
  // STATIC DATA FUNCTIONS
  // ============================================
  getSymptoms: cache(async () => {
    return prisma.symptom.findMany({
      orderBy: { index: "asc" },
    });
  }),

  getDiseases: cache(async () => {
    return prisma.disease.findMany({
      orderBy: { name: "asc" },
    });
  }),

  getDiseaseByName: cache(async (name: string) => {
    return prisma.disease.findUnique({
      where: { name },
    });
  }),
};
