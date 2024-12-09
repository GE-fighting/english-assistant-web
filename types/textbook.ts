// 定义教材相关的所有类型

export interface Version {
    id: number;
    name: string;
    created_at: number[];
  }
  
  export interface Grade {
    id: number;
    name: string;
    created_at: number[];
  }
  
  export interface Semester {
    id: number;
    name: string;
    created_at: number[];
  }
  
  export interface Textbook {
    id: number;
    name: string;
    textbook_version: string;  
    grade: string;    
    semester: string; 
    word_count: number;
    unit_count: number;
    created_at: string;
  }
  
  
  
  export interface CreateTextbookParams {
    version_id: number;
    grade_id: number;
    semester_id: number;
    name: string;
  }
  
  export interface Unit {
    id: number;
    name: string;
    textbook_id: number;
    sequence_number: number;
    created_at: string;
    word_count: number;
  }
  
  export interface TextbookDetail extends Textbook {
    units: Unit[];
  }