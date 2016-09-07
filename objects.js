const ORDER_TYPE_ASC = 1,
  ORDER_TYPE_DESC = -1;
const FIELD_TYPE_NUMBER = 0,
  FIELD_TYPE_TEXT = 1,
  FIELD_TYPE_BOOLEAN = 2,
  FIELD_TYPE_FK = 3;

function orderBy(fields, orders) {
  var order = "";
  var defaultOrder = false;
  if (typeof orders !== typeof undefined && orders.length > 0) {
    if (orders.length !== fields.length)
      throw new RangeError("Ordering type must be specified for every field, if any.");
  } else defaultOrder = true;
  for (let i = 0; i < fields.length; i++)
    order += fields[i] + " " + (defaultOrder === true ? ORDER_TYPE_ASC : orders[i]);
  return order;
}

module.exports = {
  Professor: Professor,
  DayOfWeek: DayOfWeek,
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

function Professor(siape, name) {
  this.siape = siape;
  this.name = name;
}
Professor.table = "professor";
Professor.fields = ["siape", "name"];
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
Professor.orderBy = orderBy([Professor.fields[1]]);

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
DowShiftTime.selectWhere = [undefined, DayOfWeek, Shift];

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
  "m": [3],
  "l": [1]
}
ProfessorRestriction.primaryKey = [0, 1];
ProfessorRestriction.foreignKeys = [Professor, DowShiftTime];
