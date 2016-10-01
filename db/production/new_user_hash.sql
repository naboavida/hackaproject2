
INSERT INTO organizations(
            name, code)
    VALUES ('UseConcept', 'newClientsQ4_2014');

INSERT INTO users(
             username, passwordhash, email, oid_org)
    VALUES ( 'sprazeres', '$2a$10$7vcKXhQT/0tedH9gRC/5a.YPyJ1GZ8Uq2xseipLntiNwlJSMx9tf6', 'sergio.prazeres@use.com.pt', (select oid from organizations where name = 'UseConcept') );






INSERT INTO organizations(
            name, code)
    VALUES ('Inodev', 'newClientsQ1_2015');

INSERT INTO users(
             username, passwordhash, email, oid_org)
    VALUES ( 'jcabral', '$2a$10$7vcKXhQT/0tedH9gRC/5a.YPyJ1GZ8Uq2xseipLntiNwlJSMx9tf6', 'joao.cabral@inodev.pt', (select oid from organizations where name = 'Inodev') );



INSERT INTO organizations(
            name, code)
    VALUES ('AAlcantara', 'newClientsQ1_2015');

INSERT INTO users(
             username, passwordhash, email, oid_org)
    VALUES ( 'aalcantara', '$2a$10$7vcKXhQT/0tedH9gRC/5a.YPyJ1GZ8Uq2xseipLntiNwlJSMx9tf6', 'aalcantara@mail.which', (select oid from organizations where name = 'AAlcantara') );



INSERT INTO organizations(
            name, code)
    VALUES ('MojaFarmacja', 'newClientsQ1_2015');

INSERT INTO users(
             username, passwordhash, email, oid_org)
    VALUES ( 'rmyrta', '$2a$10$7vcKXhQT/0tedH9gRC/5a.YPyJ1GZ8Uq2xseipLntiNwlJSMx9tf6', 'r.myrta@mojafarmacja.com', (select oid from organizations where name = 'MojaFarmacja') );