// Định nghĩa các type cho options
export interface SelectOption<T> {
  label: string;
  value: T;
}

export type OptionType =
  | 'GENDER'
  | 'PROVINCE'
  | 'DISTRICT'
  | 'GEMS_EMPLOYEE'
  | 'EDUCATION_LEVEL'
  | 'INFORMATIC_RELATION'
  | 'NVSP'
  | 'IC3_CERTIFICATE'
  | 'ICDL_CERTIFICATE'

export interface OptionItem {
  value: string | number | null
  label: string
}

// Định nghĩa các kiểu giá trị từ option.dto.ts
export type Gender = null | 0 | 1
export type Province = null | 'HCM' | 'TDUC' | 'BD' | 'LA'
export type District =
  | null
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | 'GVAP'
  | 'PNHUAN'
  | 'TDUC'
  | 'BTHANH'
  | 'BTAN'
  | 'TBINH'
  | 'TPHU'
  | 'BCHANH'
  | 'CGIO'
  | 'CCHI'
  | 'HMON'
  | 'NBE'
  | 'DA'
  | 'CGIUOC'
  | 'DHOA'
  | 'BLUC'
export type GemsEmployee = null | 0 | 1
export type EducationLevel = null | 0 | 1 | 2 | 3
export type InformaticRelation = null | 0 | 1
export type Nvsp = null | 0 | 1 | 2 | 3
export type Ic3Certificate = null | 0 | 1
export type IcdlCertificate = null | 0 | 1
