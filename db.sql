create table professor(
  siape integer,
  name  varchar(64),
  primary key(siape)
);
insert into professor values (1, "Graziela Simone Tonin"), (2, "Claunir Pavan"), (3, "José Bins"), (4, "Bráulio de Mello");

create table subject(
  code  varchar(8),
  title varchar(64),
  primary key(code)
);
insert into subject values ("GCH008", "Iniciação à prática científica"), ("GEX103", "Engenharia de software II"), ("GEX105", "Redes de computadores"), ("GEX107", "Computação gráfica"), ("GEX108", "Construção de compiladores");

create table link(
  siape integer,
  code  varchar(8),
  primary key(siape, code),
  foreign key(siape) references professor(siape),
  foreign key(code) references subject(code)
);
insert into link values (1, "GCH008"), (1, "GEX103"), (2, "GEX105"), (3, "GEX107"), (4, "GEX108");

-- day of week [1...6]
-- shift ('M', 'V', 'N')
-- time [1...5]
create table period(
  dow   char(1),
  shift char(1),
  time  char(1),
  primary key(dow, shift, time)
);

-- '0' means null
-- e.g.: ('1', '0', '0') will be used to restric all mondays
insert into period values
('1', '0', '0'), ('2', '0', '0'), ('3', '0', '0'), ('4', '0', '0'), ('5', '0', '0'), ('6', '0', '0'),
('0', 'M', '0'), ('0', 'V', '0'), ('0', 'N', '0'),
('0', '0', '1'), ('0', '0', '2'), ('0', '0', '3'), ('0', '0', '4'), ('0', '0', '5'),
('1', 'M', '1'), ('1', 'M', '2'), ('1', 'M', '3'), ('1', 'M', '4'), ('1', 'M', '5'),
('1', 'V', '1'), ('1', 'V', '2'), ('1', 'V', '3'), ('1', 'V', '4'), ('1', 'V', '5'),
('1', 'N', '1'), ('1', 'N', '2'), ('1', 'N', '3'), ('1', 'N', '4'),
('2', 'M', '1'), ('2', 'M', '2'), ('2', 'M', '3'), ('2', 'M', '4'), ('2', 'M', '5'),
('2', 'V', '1'), ('2', 'V', '2'), ('2', 'V', '3'), ('2', 'V', '4'), ('2', 'V', '5'),
('2', 'N', '1'), ('2', 'N', '2'), ('2', 'N', '3'), ('2', 'N', '4'),
('3', 'M', '1'), ('3', 'M', '2'), ('3', 'M', '3'), ('3', 'M', '4'), ('3', 'M', '5'),
('3', 'V', '1'), ('3', 'V', '2'), ('3', 'V', '3'), ('3', 'V', '4'), ('3', 'V', '5'),
('3', 'N', '1'), ('3', 'N', '2'), ('3', 'N', '3'), ('3', 'N', '4'),
('4', 'M', '1'), ('4', 'M', '2'), ('4', 'M', '3'), ('4', 'M', '4'), ('4', 'M', '5'),
('4', 'V', '1'), ('4', 'V', '2'), ('4', 'V', '3'), ('4', 'V', '4'), ('4', 'V', '5'),
('4', 'N', '1'), ('4', 'N', '2'), ('4', 'N', '3'), ('4', 'N', '4'),
('5', 'M', '1'), ('5', 'M', '2'), ('5', 'M', '3'), ('5', 'M', '4'), ('5', 'M', '5'),
('5', 'V', '1'), ('5', 'V', '2'), ('5', 'V', '3'), ('5', 'V', '4'), ('5', 'V', '5'),
('5', 'N', '1'), ('5', 'N', '2'), ('5', 'N', '3'), ('5', 'N', '4'),
('6', 'M', '1'), ('6', 'M', '2'), ('6', 'M', '3'), ('6', 'M', '4'), ('6', 'M', '5');

create table period_restriction(
  dow     char(1),
  shift   char(1),
  time    char(1),
  rdow    char(1),
  rshift  char(1),
  rtime   char(1),
  active  boolean default true,
  primary key(dow, shift, time, rdow, rshift, rtime),
  foreign key(dow, shift, time) references period(dow, shift, time),
  foreign key(rdow, rshift, rtime) references period(dow, shift, time)
);

create table professor_restriction(
  siape   integer,
  dow     char(1),
  shift   char(1),
  time    char(1),
  active  boolean default true,
  primary key(siape, dow, shift, time),
  foreign key(dow, shift, time) references period(dow, shift, time)
);

create table class(
  siape integer,
  code  varchar(8),
  dow   char(1),
  shift char(1),
  time  char(1),
  primary key(siape, code, dow, shift, time),
  foreign key(siape) references professor(siape),
  foreign key(code) references subject(code),
  foreign key(dow, shift, time) references period(dow, shift, time)
);
