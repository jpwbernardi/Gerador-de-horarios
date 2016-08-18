create table professor(
  name  varchar(64),
  primary key(name)
);

create table subject(
  code  varchar(8),
  title varchar(64),
  primary key(code)
);

create table link(
  name  varchar(64),
  code  varchar(8),
  primary key(name, code),
  foreign key(name) references professor(name),
  foreign key(code) references subject(code)
);
