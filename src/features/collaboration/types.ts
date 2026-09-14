export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface Invitation {
  id: string;
  courseId: string;
  courseName: string;
  email: string;
  emailLower: string;
  invitedByUid: string;
  invitedByEmail: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
  acceptedByUid?: string;
  revokedAt?: string;
  resendCount: number;
}

export type MemberRole = "owner" | "collaborator";

export interface CourseMember {
  id: string;
  courseId: string;
  uid: string;
  email: string;
  emailLower: string;
  role: MemberRole;
  addedAt: string;
  addedByUid: string;
}

export type CourseAccess = "owner" | "collaborator";

export interface SharedCourseView {
  course: import("@/features/courses/types").Course;
  access: CourseAccess;
}

export interface ContributionAttribution {
  updatedByUid: string;
  updatedByEmail: string;
  updatedAt: string;
}

export interface InvitationWithCourse extends Invitation {
  course?: import("@/features/courses/types").Course;
}