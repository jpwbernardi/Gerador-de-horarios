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
  id    integer,
  siape integer,
  code  varchar(8),
  primary key(id),
  foreign key(siape) references professor(siape),
  foreign key(code) references subject(code),
  constraint unique_link unique(siape, code)
);
insert into link(siape, code) values (1, "GCH008"), (1, "GEX103"), (2, "GEX105"), (3, "GEX107"), (4, "GEX108");

create table dayofweek(
  number  integer,
  dow     varchar(16),
  primary key(number)
);

create table shift(
  sod     integer,
  period  varchar(16),
  primary key(id)
);

create table time(
  hour  integer,
  block varchar(16),
  primary key(hour)
);

create table professor_restriction(
  professorr  integer,
  siape       integer,
  number      integer,
  sod         integer,
  hour        integer,
  active      boolean default true,
  primary key(professorr),
  foreign key(siape) references professor(siape),
  foreign key(number) references dayofweek(number),
  foreign key(sod) references shift(sod),
  foreign key(hour) references time(hour),
  constraint unique_professor_restriction unique(siape, number, sod, hour)
);

create table period_restriction(
  periodr integer,
  number  integer,
  sod     integer,
  hour    integer,
  rnumber integer,
  rsod    integer,
  rhour   integer,
  active  boolean default true,
  primary key(periodr),
  foreign key(number) references dayofweek(number),
  foreign key(sod) references shift(sod),
  foreign key(hour) references time(hour),
  foreign key(rnumber) references dayofweek(number),
  foreign key(rsod) references shift(sod),
  foreign key(rhour) references time(hour),
  constraint unique_period_restriction unique(number, sod, hour, rnumber, rsod, rhour)
);

create table class(
  lesson  integer,
  siape   integer,
  code    varchar(8),
  number  integer,
  sod     integer,
  hour    integer,
  primary key(lesson),
  foreign key(siape) references professor(siape),
  foreign key(code) references subject(code),
  foreign key(number) references dayofweek(number),
  foreign key(sod) references shift(sod),
  foreign key(hour) references time(hour),
  constraint unique_class unique(siape, code, number, sod, hour)
);
