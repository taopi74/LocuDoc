export type CoverTemplate = 'Assignment' | 'Lab Report' | 'Project' | 'Thesis';

export const COVER_TEMPLATES: CoverTemplate[] = ['Assignment', 'Lab Report', 'Project', 'Thesis'];

export type CoverData = {
  template: CoverTemplate;
  institution: string;
  department: string;
  courseTitle: string;
  courseCode: string;
  topic: string;
  studentName: string;
  studentId: string;
  studentSection: string;
  teacherName: string;
  teacherTitle: string;
  teacherDept: string;
  date: string;
  /** Optional logo, normalized to JPEG bytes. */
  logo?: Uint8Array;
};

export const EMPTY_COVER: CoverData = {
  template: 'Assignment',
  institution: '',
  department: '',
  courseTitle: '',
  courseCode: '',
  topic: '',
  studentName: '',
  studentId: '',
  studentSection: '',
  teacherName: '',
  teacherTitle: '',
  teacherDept: '',
  date: '',
};
