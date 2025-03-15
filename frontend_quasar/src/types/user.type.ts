import type {
  EducationLevel,
  GemsEmployee,
  Ic3Certificate,
  IcdlCertificate,
  InformaticRelation,
  Nvsp,
} from './option.type';

// Định nghĩa giao diện cho TeacherProfile
export interface TeacherProfile {
  gemsEmployee?: GemsEmployee | null;
  educationLevel?: EducationLevel | null;
  informaticRelation?: InformaticRelation | null;
  nvsp?: Nvsp | null;
  ic3Certificate?: Ic3Certificate | null;
  icdlCertificate?: IcdlCertificate | null;
}

// Định nghĩa giao diện User cơ bản
export interface User {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  status: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  gender?: string | null;
  dob?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  district?: string | null;
  province?: string | null;
  teacherProfile?: TeacherProfile;
}