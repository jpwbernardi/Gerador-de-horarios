create table professor(
  siape integer,
  name  varchar(64),
  primary key(siape)
);
insert into professor values
(1332944, "Adriano Sanick Padilha"),
(1770127, "Andressa Sebben"),
(1488944, "Antônio Marcos Correa Neri"),
(1645173, "Bráulio Adriano de Mello"),
(1835372, "Claunir Pavan"),
(1278144, "Denio Duarte"),
(1816330, "Fernando Bevilacqua"),
(1781719, "Luciano Lores Caimi"),
(1521671, "Marco Aurelio Spohn");

create table dayofweek(
  dow       integer,
  dow_name  varchar(16),
  primary key(dow),
  constraint unique_dow_name unique(dow_name)
);
insert into dayofweek values
(0, 'Todos'),
(2, 'Segunda-feira'),
(3, 'Terça-feira'),
(4, 'Quarta-feira'),
(5, 'Quinta-feira'),
(6, 'Sexta-feira'),
(7, 'Sábado');

create table shift(
  period      integer,
  period_name varchar(16),
  primary key(period)
);
insert into shift values
(0, 'Todos'),
(1, 'Matutino'),
(2, 'Vespertino'),
(3, 'Noturno');

create table time(
  block       integer,
  block_name  varchar(16),
  primary key(block)
);
insert into time values
(0, 'Todos'),
(1, 'Primeiro'),
(2, 'Segundo'),
(3, 'Terceiro'),
(4, 'Quarto'),
(5, 'Quinto');

create table semester(
  sem integer,
  primary key(sem)
);
insert into semester values (1), (2), (3), (4), (5), (6), (7), (8), (9), (10);

-- pode ter uma ccr com mesmo código, período e semestre?
create table subject(
  code   varchar(8),
  title  varchar(64),
  sem    integer,
  period integer,
  primary key(code, period),
  foreign key(sem) references semester(sem) on delete cascade,
  foreign key(period) references shift(period) on delete cascade
);
insert into subject values
("GEX002", "Introdução à informática", 1, 1),
("GEX001", "Matemática instrumental", 1, 1),
("GLA001", "Leitura e produção textual I", 1, 1),
("GEX003", "Algoritmos e programação", 1, 1),
("GEN001", "Circuitos digitais", 1, 1),
("GEX004", "Geometria analítica", 1, 1),

("GEX006", "Estatística básica", 2, 1),
("GLA004", "Leitura e produção textual II", 2, 1),
("GEX015", "Estrutura de dados I", 2, 1),
("GEX016", "Sistemas digitais", 2, 1),
("GEX009", "Cálculo I", 2, 1),
("GEX012", "Álgebra linear", 2, 1),

("GEX093", "Matemática discreta", 3, 1),
("GEX092", "Estrutura de dados II", 3, 1),
("GEX098", "Programação I", 3, 1),
("GEX055", "Probabilidade e estatística", 3, 1),
("GEX033", "Cálculo II", 3, 1),
("GEX100", "Organização de computadores", 3, 1),

("GEX090", "Banco de dados I", 4, 1),
("GEX099", "Programação II", 4, 1),
("GEX036", "Cálculo numérico", 4, 1),
("GCH011", "Introdução ao pensamento social", 4, 1),
("GEX104", "Teoria da computação", 4, 1),
("GEN039", "Grafos", 4, 1),

("GEX091", "Banco de dados II", 5, 1),
("GEX102", "Engenharia de software I", 5, 1),
("GCH008", "Iniciação à prática científica", 5, 1),
("GEX101", "Linguagens formais e autômatos", 5, 1),
("GCS010", "Direitos e cidadania", 5, 1),
("GEX110", "Sistemas operacionais", 5, 1),

("GCH029", "Historia da fronteira Sul", 6, 1),
("GEX103", "Engenharia de software II", 6, 1),
("GEX105", "Redes de computadores", 6, 1),
("GEX107", "Computação gráfica", 6, 1),
("GCS107", "Planejamento e gestão de projetos", 6, 1),
("GEX108", "Construção de compiladores", 6, 1),

("GCH012", "Fundamentos da crítica social", 7, 1),
("GEX109", "Inteligência artificial", 7, 1),
("GEX106", "Computação distribuída", 7, 1),
("GEX119", "Trabalho de conclusão de curso I", 7, 1),

("GCS011", "Meio ambiente, economia e sociedade", 8, 1),
("GEX112", "Segurança e auditoria de sistemas", 8, 1),
("GEX120", "Trabalho de conclusão de curso II", 8, 1),

("GEX002", "Introdução à informática", 1, 3),
("GEX001", "Matemática instrumental", 1, 3),
("GLA001", "Leitura e produção textual I", 1, 3),
("GEX003", "Algoritmos e programação", 1, 3),
("GEN001", "Circuitos digitais", 1, 3),

("GEX006", "Estatística básica", 2, 3),
("GLA004", "Leitura e produção textual II", 2, 3),
("GEX015", "Estrutura de dados I", 2, 3),
("GEX016", "Sistemas digitais", 2, 3),
("GEX004", "Geometria analítica", 2, 3),

("GEX093", "Matemática discreta", 3, 3),
("GEX092", "Estrutura de dados II", 3, 3),
("GEX098", "Programação I", 3, 3),
("GEX012", "Álgebra linear", 3, 3),
("GEX009", "Cálculo I", 3, 3),

("GEX090", "Banco de dados I", 4, 3),
("GEX099", "Programação II", 4, 3),
("GEX100", "Organização de computadores", 4, 3),
("GEX055", "Probabilidade e estatística", 4, 3),
("GEX033", "Cálculo II", 4, 3),

("GEX091", "Banco de dados II", 5, 3),
("GEX102", "ngenharia de software I", 5, 3),
("GCH008", "Iniciação à prática científica", 5, 3),
("GEX104", "Teoria da computação", 5, 3),
("GEN039", "Grafos", 5, 3),

("GCH029", "Historia da fronteira Sul", 6, 3),
("GEX103", "Engenharia software II", 6, 3),
("GEX101", "Linguagens formais e autômatos", 6, 3),
("GCS010", "Direitos e cidadania", 6, 3),
("GEX036", "Cálculo numérico", 6, 3),

("GCH012", "Fundamentos da crŕtica social", 7, 3),
("GEX109", "Inteligência artificial", 7, 3),
("GEX108", "Construção de compiladores", 7, 3),
("GEX107", "Computação gráfica", 7, 3),
("GEX110", "Sistemas operacionais", 7, 3),

("GCS011", "Meio ambiente, economia e sociedade", 8, 3),
("GEX105", "Redes de computadores", 8, 3),
("GCS107", "Planejamento e gestão de projetos", 8, 3),
("GCH011", "Introdução ao pensamento social", 8, 3),

("GEX106", "Computação distribuída", 9, 3),
("GEX112", "Segurança e auditoria de sistemas", 9, 3),
("GEX119", "Trabalho de conclusão de curso I", 9, 3),

("GEX120", "Trabalho de conclusão de curso II", 10, 3);

create table professor_subject(
  siape   integer,
  code    varchar(8),
  period  integer,
  primary key(siape, code, period),
  foreign key(siape) references professor(siape) on delete cascade,
  foreign key(code, period) references subject(code, period) on delete cascade
);
insert into professor_subject values
(1645173, "GEX108", 1),
(1835372, "GEX105", 1);

create table dow_shift_time(
  dow    varchar(16),
  period integer,
  block  varchar(16),
  primary key(dow, period, block),
  foreign key(dow) references dayofweek(dow) on delete cascade,
  foreign key(period) references shift(period) on delete cascade,
  foreign key(block) references time(block) on delete cascade
);
insert into dow_shift_time values
(0, 0, 0), (2, 0, 0), (3, 0, 0), (4, 0, 0), (5, 0, 0), (6, 0, 0),
(0, 0, 1), (2, 0, 1), (3, 0, 1), (4, 0, 1), (5, 0, 1), (6, 0, 1),
(0, 0, 2), (2, 0, 2), (3, 0, 2), (4, 0, 2), (5, 0, 2), (6, 0, 2),
(0, 0, 3), (2, 0, 3), (3, 0, 3), (4, 0, 3), (5, 0, 3), (6, 0, 3),
(0, 0, 4), (2, 0, 4), (3, 0, 4), (4, 0, 4), (5, 0, 4), (6, 0, 4),

(0, 1, 0), (2, 1, 0), (3, 1, 0), (4, 1, 0), (5, 1, 0), (6, 1, 0),
(0, 1, 1), (2, 1, 1), (3, 1, 1), (4, 1, 1), (5, 1, 1), (6, 1, 1),
(0, 1, 2), (2, 1, 2), (3, 1, 2), (4, 1, 2), (5, 1, 2), (6, 1, 2),
(0, 1, 3), (2, 1, 3), (3, 1, 3), (4, 1, 3), (5, 1, 3), (6, 1, 3),
(0, 1, 4), (2, 1, 4), (3, 1, 4), (4, 1, 4), (5, 1, 4), (6, 1, 4),
(0, 1, 5), (2, 1, 5), (3, 1, 5), (4, 1, 5), (5, 1, 5), (6, 1, 5),

(0, 2, 0), (2, 2, 0), (3, 2, 0), (4, 2, 0), (5, 2, 0), (6, 2, 0),
(0, 2, 1), (2, 2, 1), (3, 2, 1), (4, 2, 1), (5, 2, 1), (6, 2, 1),
(0, 2, 2), (2, 2, 2), (3, 2, 2), (4, 2, 2), (5, 2, 2), (6, 2, 2),
(0, 2, 3), (2, 2, 3), (3, 2, 3), (4, 2, 3), (5, 2, 3), (6, 2, 3),
(0, 2, 4), (2, 2, 4), (3, 2, 4), (4, 2, 4), (5, 2, 4), (6, 2, 4),
(0, 2, 5), (2, 2, 5), (3, 2, 5), (4, 2, 5), (5, 2, 5), (6, 2, 5),

(0, 3, 0), (2, 3, 0), (3, 3, 0), (4, 3, 0), (5, 3, 0), (6, 3, 0),
(0, 3, 1), (2, 3, 1), (3, 3, 1), (4, 3, 1), (5, 3, 1), (6, 3, 1),
(0, 3, 2), (2, 3, 2), (3, 3, 2), (4, 3, 2), (5, 3, 2), (6, 3, 2),
(0, 3, 3), (2, 3, 3), (3, 3, 3), (4, 3, 3), (5, 3, 3), (6, 3, 3),
(0, 3, 4), (2, 3, 4), (3, 3, 4), (4, 3, 4), (5, 3, 4), (6, 3, 4);

create table professor_restriction(
  siape  integer,
  dow    integer,
  period integer,
  block  integer,
  active boolean default true,
  primary key(siape, dow, period, block),
  foreign key(siape) references professor(siape) on delete cascade,
  foreign key(dow, period, block) references dow_shift_time(dow, period, block) on delete cascade
);

-- create table period_restriction(
--   periodr integer,
--   number  integer,
--   sod     integer,
--   hour    integer,
--   rnumber integer,
--   rsod    integer,
--   rhour   integer,
--   active  boolean default true,
--   primary key(periodr),
--   foreign key(number) references dayofweek(number),
--   foreign key(sod) references shift(sod),
--   foreign key(hour) references time(hour),
--   foreign key(rnumber) references dayofweek(number),
--   foreign key(rsod) references shift(sod),
--   foreign key(rhour) references time(hour),
--   constraint unique_period_restriction unique(number, sod, hour, rnumber, rsod, rhour)
-- );
--
-- create table class(
--   lesson  integer,
--   siape   integer,
--   code    varchar(8),
--   number  integer,
--   sod     integer,
--   hour    integer,
--   primary key(lesson),
--   foreign key(siape) references professor(siape),
--   foreign key(code) references subject(code),
--   foreign key(number) references dayofweek(number),
--   foreign key(sod) references shift(sod),
--   foreign key(hour) references time(hour),
--   constraint unique_class unique(siape, code, number, sod, hour)
-- );
