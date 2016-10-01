alter table users
add column userprofile json;

update users set userprofile = '{"addIndicator": false, "addPoint": false}'::json
where username = 'jcabral';


update users set userprofile = '{"compareMF": true, "dataMF": false, "olapCubeMF": true, "datTypeMF": true, "logoMF": true, "warMF": true}'::json
where oid_org = (select oid from organizations where name = 'MojaFarmacja');
