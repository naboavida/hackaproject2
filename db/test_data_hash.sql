-- post changes of dropping password and introducing passwordhash

INSERT INTO users(
             username, passwordhash, email, oid_org)
    VALUES ( 'isabelrosa', '$2a$10$7vcKXhQT/0tedH9gRC/5a.YPyJ1GZ8Uq2xseipLntiNwlJSMx9tf6', 'isamdr@gmail.com', (select oid from organizations where name = 'earthindicators') ),
    ( 'joaocristovao', '$2a$10$7vcKXhQT/0tedH9gRC/5a.YPyJ1GZ8Uq2xseipLntiNwlJSMx9tf6', 'jmacristovao@gmail.com', (select oid from organizations where name = 'earthindicators') ),
    ( 'goncalomartins', '$2a$10$7vcKXhQT/0tedH9gRC/5a.YPyJ1GZ8Uq2xseipLntiNwlJSMx9tf6', 'gfm16617@gmail.com', (select oid from organizations where name = 'earthindicators') );


-- Ei sends in a secure manner the user and password
--