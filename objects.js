const ORDER_TYPE_ASC = 1,
  ORDER_TYPE_DESC = -1;
const FIELD_TYPE_NUMBER = 0,
  FIELD_TYPE_TEXT = 1,
  FIELD_TYPE_BOOLEAN = 2,
  FIELD_TYPE_FK = 3;

module.exports = {
  Test: Test,
  Professor: Professor,
  Subject: Subject,
  DayOfWeek: DayOfWeek,
  Semester: Semester,
  Shift: Shift,
  Time: Time,
  DowShiftTime: DowShiftTime,
  ProfessorRestriction: ProfessorRestriction,
  ORDER_TYPE_ASC: ORDER_TYPE_ASC,
  ORDER_TYPE_DESC: ORDER_TYPE_DESC,
  FIELD_TYPE_NUMBER: FIELD_TYPE_NUMBER,
  FIELD_TYPE_TEXT: FIELD_TYPE_TEXT,
  FIELD_TYPE_BOOLEAN: FIELD_TYPE_BOOLEAN,
  FIELD_TYPE_FK: FIELD_TYPE_FK
}

function Test(a, b, c) {
  this.a = a;
  this.b = b;
  this.c = c;
}
Test.table = "test";
Test.fields = ["a", "b", "c"];
Test.fieldRequired = [true, true, false];
Test.titles = ["A", "B", "C"];
Test.fieldTypes = [FIELD_TYPE_TEXT, FIELD_TYPE_NUMBER, FIELD_TYPE_BOOLEAN];
Test.col = {
  "s": [12, 12, 12],
  "m": [7, 5, 4],
  "l": [3, 2, 2]
};
Test.primaryKey = [0, 1];
Test.orderBy = {
  "fields": [Test.fields]
};

function Professor(siape, name) {
  this.siape = siape;
  this.name = name;
}
Professor.table = "professor";
Professor.fields = ["siape", "name"];
Professor.fieldRequired = [true, true];
Professor.titles = ["SIAPE", "Nome do professor"];
Professor.fieldTypes = [FIELD_TYPE_NUMBER, FIELD_TYPE_TEXT];
Professor.col = {
  "s": [12, 12],
  "m": [5, 7],
  "l": [2, 3]
};
Professor.primaryKey = [0];
Professor.selectFields = [1];
Professor.autocomplete = [{
  "key": Professor.primaryKey[0],
  "value": 1
}];
Professor.orderBy = {
  "fields": [Professor.fields[1]]
};

function Subject(cod, title) {
  this.cod = cod;
  this.title = title;
}
Subject.table = "subject";
Subject.fields = ["cod", "title"];
Subject.fieldRequired = [true, true];
Subject.titles = ["Código", "Componente Curricular"];
Subject.fieldTypes = [FIELD_TYPE_TEXT, FIELD_TYPE_TEXT];
Subject.col = {
  "s": [12, 12],
  "m": [5, 7],
  "l": [2, 3]
};
Subject.primaryKey = [0];

function DayOfWeek(dow) {
  this.dow = dow;
}
DayOfWeek.table = "dayofweek";
DayOfWeek.fields = ["dow"];
DayOfWeek.titles = ["Dia da semana"];
DayOfWeek.fieldTypes = [FIELD_TYPE_TEXT];
DayOfWeek.col = {
  "s": [12],
  "m": [4],
  "l": [2]
};
DayOfWeek.primaryKey = [0];
DayOfWeek.groupBy = [DayOfWeek.fields];

function Semester(sem) {
  this.sem = sem;
}
Semester.table = "semester";
Semester.fields = ["sem"];
Semester.titles = ["Semestre"];
Semester.fieldTypes = [FIELD_TYPE_TEXT];
Semester.col = {
  "s": [12],
  "m": [4],
  "l": [2]
};
Semester.primaryKey = [0];


function Shift(period) {
  this.period = period;
}
Shift.table = "shift";
Shift.fields = ["period"];
Shift.titles = ["Turno do dia"];
Shift.fieldTypes = [FIELD_TYPE_TEXT];
Shift.col = {
  "s": [12],
  "m": [4],
  "l": [2]
};
Shift.primaryKey = [0];
Shift.groupBy = [Shift.fields];

function Time(block) {
  this.block = block;
}
Time.table = "time";
Time.fields = ["block"];
Time.titles = ["Horário do turno"];
Time.fieldTypes = [FIELD_TYPE_TEXT];
Time.col = {
  "s": [12],
  "m": [4],
  "l": [2]
};
Time.primaryKey = [0];
Time.groupBy = [Time.fields];

function DowShiftTime(dayOfWeek, shift, time) {
  this.dayOfWeek = dayOfWeek;
  this.shift = shift;
  this.time = time;
}
DowShiftTime.table = "dow_shift_time";
DowShiftTime.fieldTypes = [FIELD_TYPE_FK, FIELD_TYPE_FK, FIELD_TYPE_FK];
DowShiftTime.primaryKey = [0, 1, 2];
DowShiftTime.foreignKeys = [DayOfWeek, Shift, Time];
// DowShiftTime.selectFields = [Time];
DowShiftTime.selectWhere = [undefined, {
  "object": [DayOfWeek],
  "field": [DayOfWeek.primaryKey[0]]
}, {
  "object": [Shift],
  "field": [Shift.primaryKey[0]]
}];

function ProfessorRestriction(professor, dowShiftTime, active) {
  this.professor = professor;
  this.dowShiftTime = dowShiftTime;
  this.active = active;
}
ProfessorRestriction.table = "professor_restriction";
ProfessorRestriction.fields = ["active"];
ProfessorRestriction.titles = ["Ativa"];
ProfessorRestriction.fieldTypes = [FIELD_TYPE_FK, FIELD_TYPE_FK, FIELD_TYPE_BOOLEAN];
ProfessorRestriction.col = {
  "s": [12],
  "m": [4],
  "l": [2]
}
ProfessorRestriction.primaryKey = [0, 1];
ProfessorRestriction.foreignKeys = [Professor, DowShiftTime];
