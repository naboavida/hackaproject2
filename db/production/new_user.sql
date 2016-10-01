

-- client has requested a new user
-- Ei creates entries on db:

INSERT INTO organizations(
            name, code)
    VALUES ('Consulai', 'demo062014');



INSERT INTO users(
             username, password, email, oid_org)
    VALUES ( 'bcaldeira', 'pass', 'bcaldeira@consulai.com', (select oid from organizations where name = 'Consulai') ),
    ( 'psantos', 'pass', 'psantos@consulai.com', (select oid from organizations where name = 'Consulai') ),
    ( 'mmendes', 'pass', 'mmendes@consulai.com', (select oid from organizations where name = 'Consulai') );




INSERT INTO organizations(
            name, code)
    VALUES ('Organisolutions', 'demo062014');

INSERT INTO users(
             username, password, email, oid_org)
    VALUES ( 'lteixeira', 'pass', 'lteixeira@organisolutions.com', (select oid from organizations where name = 'Organisolutions') );




INSERT INTO organizations(
            name, code)
    VALUES ('RioMaior', 'demo062014');

INSERT INTO users(
             username, password, email, oid_org)
    VALUES ( 'jsilva', 'pass', 'jsilva@RioMaior.com', (select oid from organizations where name = 'RioMaior') ),
    ( 'jcristovao', 'pass', 'jcristovao@RioMaior.com', (select oid from organizations where name = 'RioMaior') ),
    ( 'hsantos', 'pass', 'hsantos@RioMaior.com', (select oid from organizations where name = 'RioMaior') ),
    ( 'rrosario', 'pass', 'rrosario@RioMaior.com', (select oid from organizations where name = 'RioMaior') );



INSERT INTO organizations(
            name, code)
    VALUES ('CEABN', 'demo062014');

INSERT INTO users(
             username, password, email, oid_org)
    VALUES ( 'jrego', 'pass', 'jrego@RioMaior.com', (select oid from organizations where name = 'CEABN') ),
    ( 'mbugalho', 'pass', 'mbugalho@RioMaior.com', (select oid from organizations where name = 'CEABN') );



INSERT INTO organizations(
            name, code)
    VALUES ('ISA', 'demo062014');

INSERT INTO users(
             username, password, email, oid_org)
    VALUES ( 'jpalma', 'pass', 'jpalma@ISA.com', (select oid from organizations where name = 'ISA') ),
    ( 'jcrous', 'pass', 'jcrous@ISA.com', (select oid from organizations where name = 'ISA') );




INSERT INTO organizations(
            name, code)
    VALUES ('TESE', 'demo062014');

INSERT INTO users(
             username, password, email, oid_org)
    VALUES ( 'msilva', 'pass', 'msilva@TESE.com', (select oid from organizations where name = 'TESE') );


INSERT INTO users(
             username, password, email, oid_org)
    VALUES ( 'afarinha', 'pass', 'afarinha@TESE.com', (select oid from organizations where name = 'TESE') ),
           ( 'hgomes', 'pass', 'hgomes@TESE.com', (select oid from organizations where name = 'TESE') );



INSERT INTO organizations(
            name, code)
    VALUES ('ForumFlorestal', 'demo062014');

INSERT INTO users(
             username, password, email, oid_org)
    VALUES ( 'hjoia', 'pass', 'hjoia@ForumFlorestal.com', (select oid from organizations where name = 'ForumFlorestal') );



INSERT INTO organizations(
            name, code)
    VALUES ('EstradasZambeze', 'demo062014');

INSERT INTO users(
             username, password, email, oid_org)
    VALUES ( 'jgracio', 'pass', 'jgracio@EstradasZambeze.com', (select oid from organizations where name = 'EstradasZambeze') );


INSERT INTO organizations(
            name, code)
    VALUES ('Bio3', 'demo062014');

INSERT INTO users(
             username, password, email, oid_org)
    VALUES ( 'hcosta', 'pass', 'hcosta@bio3.com', (select oid from organizations where name = 'Bio3') ),
    ( 'hcoelho', 'pass', 'hcoelho@bio3.com', (select oid from organizations where name = 'Bio3') );



INSERT INTO organizations(
            name, code)
    VALUES ('EiAdvisors', 'demo062014');

INSERT INTO users(
             username, password, email, oid_org)
    VALUES ( 'advisor', 'pass', 'advisor@EiAdvisors.com', (select oid from organizations where name = 'EiAdvisors') );



INSERT INTO organizations(
            name, code)
    VALUES ('UKEntrepreneurs', 'demo062014');

INSERT INTO users(
             username, password, email, oid_org)
    VALUES ( 'jgraham', 'pass', 'james.graham@entrepreneurs.gov.uk', (select oid from organizations where name = 'UKEntrepreneurs') );


INSERT INTO organizations(
            name, code)
    VALUES ('LojadoSal', 'demo062014');

INSERT INTO users(
             username, password, email, oid_org)
    VALUES ( 'llopes', 'pass', 'llopes@lojadosal.pt', (select oid from organizations where name = 'LojadoSal') );




INSERT INTO organizations(
            name, code)
    VALUES ('Raiz', 'demo062014');

INSERT INTO users(
             username, password, email, oid_org)
    VALUES ( 'margaridasilva', 'pass', 'margarida.silva@portucelsoporcel.com', (select oid from organizations where name = 'Raiz') ),
    ( 'sofiacorticeiro', 'pass', 'sofia.corticeiro@portucelsoporcel.com', (select oid from organizations where name = 'Raiz') );



