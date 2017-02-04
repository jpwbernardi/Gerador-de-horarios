/* Arquivo:   objects.js
   Autores:   Acácia dos Campos da Terra, Davi Rizzotto Pegoraro, Gabriel Batista Galli, Harold Cristien Santos Becker, João Pedro Winckler
              Bernardi, Matheus Henrique Trichez e Vladimir Belinski
   Descrição: o presente arquivo faz parte do projeto Gerador de Horários, no qual é criada uma aplicação que visa ser uma ferramenta
              facilitadora para a geração dos horários do semestre (em relação aos componentes curriculares) dos cursos de graduação do
              Campus Chapecó da Universidade Federal da Fronteira Sul - UFFS, apresentando uma interface gráfica que permite a manutenção de
              professores, componentes curriculares, associações, restrições e a montagem das grades de 10 fases de um curso para os turnos
              matutino, vespertino e noturno;
              * 'objects.js' corresponde ao arquivo JavaScript utilizado como base para a geração automática dos formulários que se relacionam
              com o banco de dados na aplicação.
*/

const QUERY_TYPE_INSERT = 1,
  QUERY_TYPE_UPDATE = 2,
  QUERY_TYPE_DELETE = 0,
  ORDER_TYPE_ASC = 1,
  ORDER_TYPE_DESC = -1,
  FIELD_TYPE_NUMBER = 0,
  FIELD_TYPE_TEXT = 1,
  FIELD_TYPE_BOOLEAN = 2,
  FIELD_TYPE_FK = 3,
  FILTER_ALL = 0,
  FILTER_ALL_OWN = 1,
  FILTER_ALL_PRIMARY = 2,
  VALUES_WHERE = 0,
  VALUES_INSERT = 1;

module.exports = {
  // Test: Test,
  Professor: Professor,
  Subject: Subject,
  DayOfWeek: DayOfWeek,
  Semester: Semester,
  Shift: Shift,
  Time: Time,
  DowShiftTime: DowShiftTime,
  ProfessorSubject: ProfessorSubject,
  ProfessorRestriction: ProfessorRestriction,
  QUERY_TYPE_INSERT: QUERY_TYPE_INSERT,
  QUERY_TYPE_UPDATE: QUERY_TYPE_UPDATE,
  QUERY_TYPE_DELETE: QUERY_TYPE_DELETE,
  ORDER_TYPE_ASC: ORDER_TYPE_ASC,
  ORDER_TYPE_DESC: ORDER_TYPE_DESC,
  FIELD_TYPE_NUMBER: FIELD_TYPE_NUMBER,
  FIELD_TYPE_TEXT: FIELD_TYPE_TEXT,
  FIELD_TYPE_BOOLEAN: FIELD_TYPE_BOOLEAN,
  FIELD_TYPE_FK: FIELD_TYPE_FK,
  FILTER_ALL: FILTER_ALL,
  FILTER_ALL_OWN: FILTER_ALL_OWN,
  FILTER_ALL_PRIMARY: FILTER_ALL_PRIMARY,
  VALUES_WHERE: VALUES_WHERE,
  VALUES_INSERT: VALUES_INSERT
}

function Professor(siape, name) {
  this.siape = siape;
  this.name = name;
}
Professor.formTitle = "Professores";
Professor.table = "professor";
Professor.fields = ["siape", "name"];
Professor.fieldRequired = [true, true];
Professor.titles = ["SIAPE", "Nome do professor"];
Professor.fieldTypes = [FIELD_TYPE_TEXT, FIELD_TYPE_TEXT];
Professor.col = {
  "s": [12, 12],
  "m": [5, 7],
  "l": [2, 3]
};
Professor.primaryKey = [0];
Professor.foreignTitle = 1;
Professor.selectFields = [1];
Professor.orderBy = {
  "fields": [Professor.fields[1]]
};

function DayOfWeek(dow, dow_name) {
  this.dow = dow;
  this.dow_name = dow_name;
}
DayOfWeek.table = "dayofweek";
DayOfWeek.fields = ["dow", "dow_name"];
DayOfWeek.fieldRequired = [true, true];
DayOfWeek.titles = ["Número", "Dia da semana"];
DayOfWeek.fieldTypes = [FIELD_TYPE_NUMBER, FIELD_TYPE_TEXT];
DayOfWeek.col = {
  "s": [12, 12],
  "m": [3, 5],
  "l": [1, 2]
};
DayOfWeek.primaryKey = [0];
DayOfWeek.foreignTitle = 1;
DayOfWeek.selectFields = [1];
DayOfWeek.groupBy = [DayOfWeek.fields[0]];
DayOfWeek.orderBy = {
  "fields": [DayOfWeek.fields[0]]
};

function Shift(period, period_name) {
  this.period = period;
  this.period_name = period_name;
}
Shift.table = "shift";
Shift.fields = ["period", "period_name"];
Shift.fieldRequired = [true, true];
Shift.titles = ["Número", "Turno do dia"];
Shift.fieldTypes = [FIELD_TYPE_NUMBER, FIELD_TYPE_TEXT];
Shift.col = {
  "s": [12, 12],
  "m": [3, 5],
  "l": [1, 2]
};
Shift.primaryKey = [0];
Shift.foreignTitle = 1;
Shift.selectFields = [1];
Shift.groupBy = [Shift.fields[0]];
Shift.orderBy = {
  "fields": [Shift.fields[0]]
};

function Time(block, block_name) {
  this.block = block;
  this.block_name = block_name;
}
Time.table = "time";
Time.fields = ["block", "block_name"];
Time.fieldRequired = [true, true];
Time.titles = ["Número", "Horário do turno"];
Time.fieldTypes = [FIELD_TYPE_NUMBER, FIELD_TYPE_TEXT];
Time.col = {
  "s": [12, 12],
  "m": [3, 5],
  "l": [1, 2]
};
Time.primaryKey = [0];
Time.foreignTitle = 1;
Time.selectFields = [1];
Time.groupBy = [Time.fields[0]];
Time.orderBy = {
  "fields": [Time.fields[0]]
};

function Semester(sem) {
  this.sem = sem;
}
Semester.table = "semester";
Semester.fields = ["sem"];
Semester.fieldRequired = [true];
Semester.titles = ["Fase"];
Semester.fieldTypes = [FIELD_TYPE_NUMBER];
Semester.col = {
  "s": [12],
  "m": [2],
  "l": [1]
};
Semester.primaryKey = [0];
Semester.foreignTitle = 0;
Semester.groupBy = [Semester.fields[0]];
Semester.orderBy = {
  "fields": [Semester.fields[0]]
};

function Subject(code, title, sem, period) {
  this.code = code;
  this.title = title;
  this.sem = sem;
  this.period = period;
}
Subject.formTitle = "Componentes curriculares";
Subject.table = "subject";
Subject.fields = ["code", "title"];
Subject.fieldRequired = [true, true, true, true];
Subject.titles = ["Código", "Componente curricular"];
Subject.fieldTypes = [FIELD_TYPE_TEXT, FIELD_TYPE_TEXT, FIELD_TYPE_FK, FIELD_TYPE_FK];
Subject.col = {
  "s": [12, 12],
  "m": [5, 7],
  "l": [2, 3]
};
Subject.primaryKey = [0, 2, 3];
Subject.foreignTitle = 1;
Subject.foreignKey = [undefined, undefined, Semester, Shift];
Subject.selectFields = [0, 1];
Subject.selectWhere = [undefined, undefined, {
  "object": [Subject],
  "field": [Subject.primaryKey[0]]
}, {
  "object": [Subject, Semester],
  "field": [Subject.primaryKey[0], Semester.primaryKey[0]]
}];
Subject.groupBy = [Subject.fields[0]];
Subject.orderBy = {
  "fields": [Subject.fields[1], Shift.fields[0], Semester.fields[0]]
};

function ProfessorSubject(siape, subject) {
  this.siape = siape;
  this.subject = subject;
}
ProfessorSubject.formTitle = "Associações";
ProfessorSubject.table = "professor_subject";
ProfessorSubject.fieldRequired = [true, true];
ProfessorSubject.fieldTypes = [FIELD_TYPE_FK, FIELD_TYPE_FK];
ProfessorSubject.primaryKey = [0, 1];
ProfessorSubject.foreignKey = [Professor, Subject];
ProfessorSubject.orderBy = {
  "fields": [Professor.fields[1], Subject.fields[1]]
};

function DowShiftTime(dayOfWeek, shift, time) {
  this.dayOfWeek = dayOfWeek;
  this.shift = shift;
  this.time = time;
}
DowShiftTime.table = "dow_shift_time";
DowShiftTime.fieldTypes = [FIELD_TYPE_FK, FIELD_TYPE_FK, FIELD_TYPE_FK];
DowShiftTime.primaryKey = [0, 1, 2];
DowShiftTime.foreignKey = [DayOfWeek, Shift, Time];
DowShiftTime.selectWhere = [undefined, {
  "object": [DayOfWeek],
  "field": DayOfWeek.primaryKey // Isso é um vetor
}, {
  "object": [Shift],
  "field": Shift.primaryKey // Isso é um vetor
}];

function ProfessorRestriction(professor, dowShiftTime, active) {
  this.professor = professor;
  this.dowShiftTime = dowShiftTime;
  this.active = active;
}
ProfessorRestriction.formTitle = "Restrições";
ProfessorRestriction.table = "professor_restriction";
ProfessorRestriction.fields = ["active"];
ProfessorRestriction.fieldRequired = [true, true, true];
ProfessorRestriction.titles = ["Ativa"];
ProfessorRestriction.fieldTypes = [FIELD_TYPE_FK, FIELD_TYPE_FK, FIELD_TYPE_BOOLEAN];
ProfessorRestriction.col = {
  "s": [12],
  "m": [4],
  "l": [1]
}
ProfessorRestriction.primaryKey = [0, 1];
ProfessorRestriction.foreignKey = [Professor, DowShiftTime, undefined];

// function Test(a, b, c) {
//   this.a = a;
//   this.b = b;
//   this.c = c;
// }
// Test.table = "test";
// Test.fields = ["a", "b", "c"];
// Test.fieldRequired = [true, true, false];
// Test.titles = ["A", "B", "C"];
// Test.fieldTypes = [FIELD_TYPE_TEXT, FIELD_TYPE_NUMBER, FIELD_TYPE_BOOLEAN];
// Test.col = {
//   "s": [12, 12, 12],
//   "m": [7, 5, 4],
//   "l": [3, 2, 2]
// };
// Test.primaryKey = [0, 1];
// Test.orderBy = {
//   "fields": [Test.fields]
// };
