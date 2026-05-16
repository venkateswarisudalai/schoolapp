// Single source of truth for class definitions.
// Existing components still have their own copies; new code (admissionNumber generation,
// teacher username builder, etc.) reads from here so the class-code mapping stays consistent.

export type ClassCode = 'prekg' | 'lkg' | 'ukg';

export interface ClassDef {
  id: string;        // Firestore classId (class-1 / class-2 / class-3)
  name: string;      // Display name shown to parents
  code: ClassCode;   // Short slug used in IDs (mkp-prekg-01, mkp.prekg.priya)
}

export const CLASSES: ClassDef[] = [
  { id: 'class-1', name: 'Pre-KG', code: 'prekg' },
  { id: 'class-2', name: 'LKG', code: 'lkg' },
  { id: 'class-3', name: 'UKG', code: 'ukg' },
];

export const getClassCode = (classId: string): ClassCode => {
  return CLASSES.find(c => c.id === classId)?.code || 'prekg';
};

export const getClassName = (classId: string): string => {
  return CLASSES.find(c => c.id === classId)?.name || classId;
};

export const getClassByCode = (code: ClassCode): ClassDef | undefined => {
  return CLASSES.find(c => c.code === code);
};
