
-- demo data


-- delete from indicators
-- delete from points
-- delete from projects


INSERT INTO organizations(
            name, code)
    VALUES ('earthindicators', '123');


INSERT INTO users(
            username, password, email, oid_org)
    VALUES ('naboavida', 'pass', 'naboavida@gmail.com', 1);

INSERT INTO users(
            username, password, email, oid_org)
    VALUES ('jpsantos', 'pass', 'jpsantos@gmail.com', 1);


INSERT INTO projects(
            title, area, location)
    VALUES ('Water Collaboration', 123.5, 'São Tomé'),
            ('Oilfields', 453.5, 'Texas, US');


INSERT INTO organizations_projects(
        oid_org, pid_proj)
    VALUES (1, 1),
            (1, 2);



    

INSERT INTO points(
            x, y, location, picturename, pid_proj)
    VALUES (32.666667, -16.85, 'Santa Maria', 'santa_maria_point.jpg', 1);
INSERT INTO points(
            x, y, location, picturename, pid_proj)
    VALUES (32.666667, -16.95, 'São José', 'sao_jose_point.jpg', 1);


INSERT INTO indicators(
            title, unit, alarm, value, readings, pid_proj, min, max)
    VALUES ('Water Quality', '', 'yes', 'Good', '[{"value":"Good", "timestamp":"2014-06-20"}]'::json, 1, 1, 1);

INSERT INTO parameters(
            title, unit, alarm, value, objective, min, max, readings, iid_ind)
    VALUES ('pH', '', 'yes', 7.3, 7, 5, 8, '[{"value":7, "timestamp":"2014-06-20"}]'::json, 1);
INSERT INTO parameters(
            title, unit, alarm, value, objective, min, max, readings, iid_ind)
    VALUES ('Coliforms', 'UFC/100ml', 'yes', 6, 2, 0, 6, '[{"value":6, "timestamp":"2014-06-20"}]'::json, 1);





INSERT INTO indicators(
            title, unit, alarm, value, readings, pid_proj, pointid_point, min, max)
    VALUES ('Water Quality', '', 'yes', 'Good', '[{"value":"Good", "timestamp":"2014-06-10"}]'::json, 1, 1, 1, 1);

INSERT INTO parameters(
            title, unit, alarm, value, objective, min, max, readings, iid_ind)
    VALUES ('Coliforms', 'UFC/100ml', 'yes', 4, 2, 0, 6, '[{"value":4, "timestamp":"2014-06-20"}]'::json, 2);

INSERT INTO parameters(
            title, unit, alarm, value, objective, min, max, readings, iid_ind)
    VALUES ('Level', 'l', 'yes', 4, 10, 5, 12, '[{"value":4, "timestamp":"2014-06-20"}]'::json, 2);


INSERT INTO activities(
            title, description, responsible, start, allDay, pid_proj)
    VALUES ('Budget Revision', 'The monthly task to revise the operational expenses and profits.', 'João Santos', '2014-06-20', true, 1);

INSERT INTO activities(
            title, description, responsible, start, allDay, pid_proj, pointid_point)
    VALUES ('Budget Revision on Point 1', 'The monthly task to revise the operational expenses and profits.', 'João Santos', '2014-06-23', true, 1, 1);



INSERT INTO organizations(
            name, code)
    VALUES ('Inodev', 'newClientsQ1_2015');

INSERT INTO users(
             username, passwordhash, email, oid_org)
    VALUES ( 'jcabral', '$2a$10$7vcKXhQT/0tedH9gRC/5a.YPyJ1GZ8Uq2xseipLntiNwlJSMx9tf6', 'joao.cabral@inodev.pt', (select oid from organizations where name = 'Inodev') );


SELECT * FROM users
where username = 'jcabral'

update users set userprofile = '{"addIndicator": false, "addPoint": false}'::json
where username = 'jcabral'

#to allow some features to be hidden for any particular users
update users set userprofile = '{"compareMF": true, "dataMF": false, "datTypeMF": true, "olapCubeMF": true, "logoMF": true, "heatMapMF": true}'::json
where username = 'XXXX';



INSERT INTO organizations(
            name, code)
    VALUES ('GeneralMills', 'newClientsQ1_2015');

INSERT INTO users(
             username, passwordhash, email, oid_org)
    VALUES ( 'GenMills', '$2a$10$7vcKXhQT/0tedH9gRC/5a.YPyJ1GZ8Uq2xseipLntiNwlJSMx9tf6', 'michael.finete@genmills.com', (select oid from organizations where name = 'GeneralMills') );


update users set userprofile = '{"mapGM": true, "occurrencesGM": true, "configGM": true, "logoGM":true, "olapGM": true, "prodGM":true, "annualGM":true, "histGM":true, "barsGM":true, "regionGM":true}'::json
where username = 'GenMills';

select * from users
where username = 'GenMills';
