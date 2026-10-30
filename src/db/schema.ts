// SQLite schema for ChemEng's Intelligent Workbench (drizzle-orm/sqlite-core).
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const screenStates = sqliteTable('screen_states', {
  id: text('id').primaryKey(),
  activeWorkbench: text('active_workbench').notNull().default('wb1-visual-verifier'),
  personaMode: text('persona_mode').notNull().default('plant'), // 'learn' | 'plant'
  themeMode: text('theme_mode').notNull().default('paper'), // 'paper' | 'blueprint'
  selectedChipsJson: text('selected_chips_json').notNull().default('[]'),
  payloadJson: text('payload_json').notNull().default('{}'),
  updatedAt: integer('updated_at').notNull(),
});

export const savedCalculations = sqliteTable('saved_calculations', {
  id: text('id').primaryKey(),
  projectCode: text('project_code').notNull().default(''),
  equipmentTag: text('equipment_tag').notNull().default(''),
  workbenchType: text('workbench_type').notNull().default(''),
  revision: text('revision').notNull().default('Rev 0 — Issued for Review'),
  inputsJson: text('inputs_json').notNull().default('{}'),
  outputsJson: text('outputs_json').notNull().default('{}'),
  equationsJson: text('equations_json').notNull().default('[]'),
  createdAt: integer('created_at').notNull(),
});

export const pdfAnchors = sqliteTable('pdf_anchors', {
  id: text('id').primaryKey(),
  sectionNum: integer('section_num').notNull(),
  secPageCode: text('sec_page_code').notNull(),
  pdfPageNumber: integer('pdf_page_number').notNull(),
  caption: text('caption').notNull().default(''),
  bboxJson: text('bbox_json').notNull().default('[]'),
});
