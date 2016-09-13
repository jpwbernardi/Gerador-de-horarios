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

create table semester(
  sem integer,
  primary key(sem)
);
insert into semester values (1), (2), (3), (4), (5), (6), (7), (8), (9), (10);

create table shift(
  period  varchar(16),
  primary key(period)
);
insert into shift values ('Todos'), ('Matutino'), ('Vespertino'), ('Noturno');

  create table subject(
    code   varchar(8),
    title  varchar(64),
    sem    integer,
    period varchar(16),
    primary key(code, period),
    foreign key(sem) references semester(sem) on delete cascade,
    foreign key(period) references shift(period) on delete cascade
  );

  insert into subject values
  ("GEX002", "Introdução à informática", 1, 'Matutino'),
  ("GEX001", "Matemática instrumental", 1, 'Matutino'),
  ("GLA001", "Leitura e produção textual I", 1, 'Matutino'),
  ("GEX003", "Algoritmos e programação", 1, 'Matutino'),
  ("GEN001", "Circuitos digitais", 1, 'Matutino'),
  ("GEX004", "Geometria analítica", 1, 'Matutino'),

  ("GEX006", "Estatística básica", 2, 'Matutino'),
  ("GLA004", "Leitura e produção textual II", 2, 'Matutino'),
  ("GEX015", "Estrutura de dados I", 2, 'Matutino'),
  ("GEX016", "Sistemas digitais", 2, 'Matutino'),
  ("GEX009", "Cálculo I", 2, 'Matutino'),
  ("GEX012", "Álgebra linear", 2, 'Matutino'),

  ("GEX093", "Matemática discreta", 3, 'Matutino'),
  ("GEX092", "Estrutura de dados II", 3, 'Matutino'),
  ("GEX098", "Programação I", 3, 'Matutino'),
  ("GEX055", "Probabilidade e estatística", 3, 'Matutino'),
  ("GEX033", "Cálculo II", 3, 'Matutino'),
  ("GEX100", "Organização de computadores", 3, 'Matutino'),

  ("GEX090", "Banco de dados I", 4, 'Matutino'),
  ("GEX099", "Programação II", 4, 'Matutino'),
  ("GEX036", "Cálculo numérico", 4, 'Matutino'),
  ("GCH011", "Introdução ao pensamento social", 4, 'Matutino'),
  ("GEX104", "Teoria da computação", 4, 'Matutino'),
  ("GEN039", "Grafos", 4, 'Matutino'),

  ("GEX091", "Banco de dados II", 5, 'Matutino'),
  ("GEX102", "Engenharia de software I", 5, 'Matutino'),
  ("GCH008", "Iniciação à prática científica", 5, 'Matutino'),
  ("GEX101", "Linguagens formais e autômatos", 5, 'Matutino'),
  ("GCS010", "Direitos e cidadania", 5, 'Matutino'),
  ("GEX110", "Sistemas operacionais", 5, 'Matutino'),

  ("GCH029", "Historia da fronteira Sul", 6, 'Matutino'),
  ("GEX103", "Engenharia de software II", 6, 'Matutino'),
  ("GEX105", "Redes de computadores", 6, 'Matutino'),
  ("GEX107", "Computação gráfica", 6, 'Matutino'),
  ("GCS107", "Planejamento e gestão de projetos", 6, 'Matutino'),
  ("GEX108", "Construção de compiladores", 6, 'Matutino'),

  ("GCH012", "Fundamentos da crítica social", 7, 'Matutino'),
  ("GEX109", "Inteligência artificial", 7, 'Matutino'),
  ("GEX106", "Computação distribuída", 7, 'Matutino'),
  ("GEX119", "Trabalho de conclusão de curso I", 7, 'Matutino'),

  ("GCS011", "Meio ambiente, economia e sociedade", 8, 'Matutino'),
  ("GEX112", "Segurança e auditoria de sistemas", 8, 'Matutino'),
  ("GEX120", "Trabalho de conclusão de curso II", 8, 'Matutino'),

  ("GEX002", "Introdução à informática", 1, 'Noturno'),
  ("GEX001", "Matemática instrumental", 1, 'Noturno'),
  ("GLA001", "Leitura e produção textual I", 1, 'Noturno'),
  ("GEX003", "Algoritmos e programação", 1, 'Noturno'),
  ("GEN001", "Circuitos digitais", 1, 'Noturno'),

  ("GEX006", "Estatística básica", 2, 'Noturno'),
  ("GLA004", "Leitura e produção textual II", 2, 'Noturno'),
  ("GEX015", "Estrutura de dados I", 2, 'Noturno'),
  ("GEX016", "Sistemas digitais", 2, 'Noturno'),
  ("GEX004", "Geometria analítica", 2, 'Noturno'),

  ("GEX093", "Matemática discreta", 3, 'Noturno'),
  ("GEX092", "Estrutura de dados II", 3, 'Noturno'),
  ("GEX098", "Programação I", 3, 'Noturno'),
  ("GEX012", "Álgebra linear", 3, 'Noturno'),
  ("GEX009", "Cálculo I", 3, 'Noturno'),

  ("GEX090", "Banco de dados I", 4, 'Noturno'),
  ("GEX099", "Programação II", 4, 'Noturno'),
  ("GEX100", "Organização de computadores", 4, 'Noturno'),
  ("GEX055", "Probabilidade e estatística", 4, 'Noturno'),
  ("GEX033", "Cálculo II", 4, 'Noturno'),

  ("GEX091", "Banco de dados II", 5, 'Noturno'),
  ("GEX102", "ngenharia de software I", 5, 'Noturno'),
  ("GCH008", "Iniciação à prática científica", 5, 'Noturno'),
  ("GEX104", "Teoria da computação", 5, 'Noturno'),
  ("GEN039", "Grafos", 5, 'Noturno'),

  ("GCH029", "Historia da fronteira Sul", 6, 'Noturno'),
  ("GEX103", "Engenharia software II", 6, 'Noturno'),
  ("GEX101", "Linguagens formais e autômatos", 6, 'Noturno'),
  ("GCS010", "Direitos e cidadania", 6, 'Noturno'),
  ("GEX036", "Cálculo numérico", 6, 'Noturno'),

  ("GCH012", "Fundamentos da crŕtica social", 7, 'Noturno'),
  ("GEX109", "Inteligência artificial", 7, 'Noturno'),
  ("GEX108", "Construção de compiladores", 7, 'Noturno'),
  ("GEX107", "Computação gráfica", 7, 'Noturno'),
  ("GEX110", "Sistemas operacionais", 7, 'Noturno'),

  ("GCS011", "Meio ambiente, economia e sociedade", 8, 'Noturno'),
  ("GEX105", "Redes de computadores", 8, 'Noturno'),
  ("GCS107", "Planejamento e gestão de projetos", 8, 'Noturno'),
  ("GCH011", "Introdução ao pensamento social", 8, 'Noturno'),

  ("GEX106", "Computação distribuída", 9,'Noturno'),
  ("GEX112", "Segurança e auditoria de sistemas", 9,'Noturno'),
  ("GEX119", "Trabalho de conclusão de curso I", 9,'Noturno'),

  ("GEX120", "Trabalho de conclusão de curso II", 10,'Noturno');

create table professor_subject(
  siape integer,
  code  varchar(8),
  period varchar(16),
  primary key(siape, code, period),
  foreign key(siape) references professor(siape) on delete cascade,
  foreign key(code, period) references subject(code, period) on delete cascade
);
insert into professor_subject values
(1645173, "GEX108", 'Matutino'),
(1835372, "GEX105", 'Matutino');

create table dayofweek(
  dow varchar(16),
  primary key(dow)
);
insert into dayofweek values ('Todos'), ('Segunda-feira'), ('Terça-feira'), ('Quarta-feira'), ('Quinta-feira'), ('Sexta-feira');

create table time(
  block varchar(16),
  primary key(block)
);
insert into time values ('Todos'), ('Primeiro'), ('Segundo'), ('Terceiro'), ('Quarto'), ('Quinto');

create table dow_shift_time(
  dow    varchar(16),
  period varchar(16),
  block  varchar(16),
  primary key(dow, period, block),
  foreign key(dow) references dayofweek(dow) on delete cascade,
  foreign key(period) references shift(period) on delete cascade,
  foreign key(block) references time(block) on delete cascade
);
insert into dow_shift_time values
  ('Todos', 'Todos', 'Todos'), ('Segunda-feira', 'Todos', 'Todos'), ('Terça-feira', 'Todos', 'Todos'), ('Quarta-feira', 'Todos', 'Todos'), ('Quinta-feira', 'Todos', 'Todos'), ('Sexta-feira', 'Todos', 'Todos'),
  ('Todos', 'Todos', 'Primeiro'), ('Segunda-feira', 'Todos', 'Primeiro'), ('Terça-feira', 'Todos', 'Primeiro'), ('Quarta-feira', 'Todos', 'Primeiro'), ('Quinta-feira', 'Todos', 'Primeiro'), ('Sexta-feira', 'Todos', 'Primeiro'),
  ('Todos', 'Todos', 'Segundo'), ('Segunda-feira', 'Todos', 'Segundo'), ('Terça-feira', 'Todos', 'Segundo'), ('Quarta-feira', 'Todos', 'Segundo'), ('Quinta-feira', 'Todos', 'Segundo'), ('Sexta-feira', 'Todos', 'Segundo'),
  ('Todos', 'Todos', 'Terceiro'), ('Segunda-feira', 'Todos', 'Terceiro'), ('Terça-feira', 'Todos', 'Terceiro'), ('Quarta-feira', 'Todos', 'Terceiro'), ('Quinta-feira', 'Todos', 'Terceiro'), ('Sexta-feira', 'Todos', 'Terceiro'),
  ('Todos', 'Todos', 'Quarto'), ('Segunda-feira', 'Todos', 'Quarto'), ('Terça-feira', 'Todos', 'Quarto'), ('Quarta-feira', 'Todos', 'Quarto'), ('Quinta-feira', 'Todos', 'Quarto'), ('Sexta-feira', 'Todos', 'Quarto'),

  ('Todos', 'Matutino', 'Todos'), ('Segunda-feira', 'Matutino', 'Todos'), ('Terça-feira', 'Matutino', 'Todos'), ('Quarta-feira', 'Matutino', 'Todos'), ('Quinta-feira', 'Matutino', 'Todos'), ('Sexta-feira', 'Matutino', 'Todos'),
  ('Todos', 'Matutino', 'Primeiro'), ('Segunda-feira', 'Matutino', 'Primeiro'), ('Terça-feira', 'Matutino', 'Primeiro'), ('Quarta-feira', 'Matutino', 'Primeiro'), ('Quinta-feira', 'Matutino', 'Primeiro'), ('Sexta-feira', 'Matutino', 'Primeiro'),
  ('Todos', 'Matutino', 'Segundo'), ('Segunda-feira', 'Matutino', 'Segundo'), ('Terça-feira', 'Matutino', 'Segundo'), ('Quarta-feira', 'Matutino', 'Segundo'), ('Quinta-feira', 'Matutino', 'Segundo'), ('Sexta-feira', 'Matutino', 'Segundo'),
  ('Todos', 'Matutino', 'Terceiro'), ('Segunda-feira', 'Matutino', 'Terceiro'), ('Terça-feira', 'Matutino', 'Terceiro'), ('Quarta-feira', 'Matutino', 'Terceiro'), ('Quinta-feira', 'Matutino', 'Terceiro'), ('Sexta-feira', 'Matutino', 'Terceiro'),
  ('Todos', 'Matutino', 'Quarto'), ('Segunda-feira', 'Matutino', 'Quarto'), ('Terça-feira', 'Matutino', 'Quarto'), ('Quarta-feira', 'Matutino', 'Quarto'), ('Quinta-feira', 'Matutino', 'Quarto'), ('Sexta-feira', 'Matutino', 'Quarto'),
  ('Todos', 'Matutino', 'Quinto'), ('Segunda-feira', 'Matutino', 'Quinto'), ('Terça-feira', 'Matutino', 'Quinto'), ('Quarta-feira', 'Matutino', 'Quinto'), ('Quinta-feira', 'Matutino', 'Quinto'), ('Sexta-feira', 'Matutino', 'Quinto'),

  ('Todos', 'Vespertino', 'Todos'), ('Segunda-feira', 'Vespertino', 'Todos'), ('Terça-feira', 'Vespertino', 'Todos'), ('Quarta-feira', 'Vespertino', 'Todos'), ('Quinta-feira', 'Vespertino', 'Todos'), ('Sexta-feira', 'Vespertino', 'Todos'),
  ('Todos', 'Vespertino', 'Primeiro'), ('Segunda-feira', 'Vespertino', 'Primeiro'), ('Terça-feira', 'Vespertino', 'Primeiro'), ('Quarta-feira', 'Vespertino', 'Primeiro'), ('Quinta-feira', 'Vespertino', 'Primeiro'), ('Sexta-feira', 'Vespertino', 'Primeiro'),
  ('Todos', 'Vespertino', 'Segundo'), ('Segunda-feira', 'Vespertino', 'Segundo'), ('Terça-feira', 'Vespertino', 'Segundo'), ('Quarta-feira', 'Vespertino', 'Segundo'), ('Quinta-feira', 'Vespertino', 'Segundo'), ('Sexta-feira', 'Vespertino', 'Segundo'),
  ('Todos', 'Vespertino', 'Terceiro'), ('Segunda-feira', 'Vespertino', 'Terceiro'), ('Terça-feira', 'Vespertino', 'Terceiro'), ('Quarta-feira', 'Vespertino', 'Terceiro'), ('Quinta-feira', 'Vespertino', 'Terceiro'), ('Sexta-feira', 'Vespertino', 'Terceiro'),
  ('Todos', 'Vespertino', 'Quarto'), ('Segunda-feira', 'Vespertino', 'Quarto'), ('Terça-feira', 'Vespertino', 'Quarto'), ('Quarta-feira', 'Vespertino', 'Quarto'), ('Quinta-feira', 'Vespertino', 'Quarto'), ('Sexta-feira', 'Vespertino', 'Quarto'),
  ('Todos', 'Vespertino', 'Quinto'), ('Segunda-feira', 'Vespertino', 'Quinto'), ('Terça-feira', 'Vespertino', 'Quinto'), ('Quarta-feira', 'Vespertino', 'Quinto'), ('Quinta-feira', 'Vespertino', 'Quinto'), ('Sexta-feira', 'Vespertino', 'Quinto'),

  ('Todos', 'Noturno', 'Todos'), ('Segunda-feira', 'Noturno', 'Todos'), ('Terça-feira', 'Noturno', 'Todos'), ('Quarta-feira', 'Noturno', 'Todos'), ('Quinta-feira', 'Noturno', 'Todos'), ('Sexta-feira', 'Noturno', 'Todos'),
  ('Todos', 'Noturno', 'Primeiro'), ('Segunda-feira', 'Noturno', 'Primeiro'), ('Terça-feira', 'Noturno', 'Primeiro'), ('Quarta-feira', 'Noturno', 'Primeiro'), ('Quinta-feira', 'Noturno', 'Primeiro'), ('Sexta-feira', 'Noturno', 'Primeiro'),
  ('Todos', 'Noturno', 'Segundo'), ('Segunda-feira', 'Noturno', 'Segundo'), ('Terça-feira', 'Noturno', 'Segundo'), ('Quarta-feira', 'Noturno', 'Segundo'), ('Quinta-feira', 'Noturno', 'Segundo'), ('Sexta-feira', 'Noturno', 'Segundo'),
  ('Todos', 'Noturno', 'Terceiro'), ('Segunda-feira', 'Noturno', 'Terceiro'), ('Terça-feira', 'Noturno', 'Terceiro'), ('Quarta-feira', 'Noturno', 'Terceiro'), ('Quinta-feira', 'Noturno', 'Terceiro'), ('Sexta-feira', 'Noturno', 'Terceiro'),
  ('Todos', 'Noturno', 'Quarto'), ('Segunda-feira', 'Noturno', 'Quarto'), ('Terça-feira', 'Noturno', 'Quarto'), ('Quarta-feira', 'Noturno', 'Quarto'), ('Quinta-feira', 'Noturno', 'Quarto'), ('Sexta-feira', 'Noturno', 'Quarto');

create table professor_restriction(
  siape  integer,
  dow    varchar(16),
  period varchar(16),
  block  varchar(16),
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
