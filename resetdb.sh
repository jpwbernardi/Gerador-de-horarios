# Arquivo:   resetdb.sh
# Autores:   Acácia dos Campos da Terra, Davi Rizzotto Pegoraro, Gabriel Batista Galli, Harold Cristien Santos Becker, João Pedro Winckler
#            Bernardi, Matheus Henrique Trichez e Vladimir Belinski
# Descrição: o presente arquivo faz parte do projeto Gerador de Horários, no qual é criada uma aplicação que visa ser uma ferramenta
#            facilitadora para a geração dos horários do semestre (em relação aos componentes curriculares) dos cursos de graduação do
#            Campus Chapecó da Universidade Federal da Fronteira Sul - UFFS, apresentando uma interface gráfica que permite a manutenção de
#            professores, componentes curriculares, associações, restrições e a montagem das grades de 10 fases de um curso para os turnos
#            matutino, vespertino e noturno;
#            * 'resetdb.sh' corresponde a um script responsável pelo reset do banco de dados da aplicação

#!/bin/bash
rm scheduler.db
cat db.sql | sqlite3 scheduler.db
