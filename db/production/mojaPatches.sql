update users set userprofile = '{"compareMF": true, "dataMF": false, "datTypeMF": true, "olapCubeMF": true, "logoMF": true, "warMF": true, "heatMapMF": true}'::json
where oid_org = (select oid from organizations where name = 'MojaFarmacja');


update occurrences
set object = (regexp_replace(object::text, 'date":"2015-03-15"', 'date":"2015-03-17"'))::json
where pid_proj = 419
and object->>'date' = '2015-03-15'



delete from widgets 
where title = 'NPS INDEX (HoN)' and pid_proj = 419;

delete from indicators 
where title = 'NPS INDEX (HoN)' and pid_proj = 419;

update widgets
set title = 'NPS INDEX (HoN)'
where pid_proj = 419 and title = 'Happy or Not';

update indicators
set title = 'NPS INDEX (HoN)'
where pid_proj = 419 and title = 'Happy or Not';



update users set userprofile = '{"compareMF": true, "dataMF": false, "datTypeMF": true, "olapCubeMF": true, "logoMF": true, "warMF": true, "heatMapMF": true, "testEmailConfig": true, "isadmin": true}'::json
where username = 'naboavida' or username = 'naboavidaMJ';


update projects
set uservisible = FALSE
where pid = 518


update projects
	set mailconfig = '{"Basket": "http://app.earthindicators.com/img/mail/basket.png", 
	"Multiline Bills": "http://app.earthindicators.com/img/mail/bills.png", 
	"Number of Customers": "http://app.earthindicators.com/img/mail/customers.png", 
	"Net Sales": "http://app.earthindicators.com/img/mail/sales.png",
	"Net Margin": "http://app.earthindicators.com/img/mail/margin.png"}'
	where pid = 518



update projects
set mailinglists = '{"immediate":[],"daily":["nuno.boavida@earthindicators.com","isabel.rosa@earthindicators.com","joao.santos@earthindicators.com","joao.cabral@inodev.pt","m.klimek@mojafarmacja.com","r.myrta@mojafarmacja.com","mraposo@institutogalenico.pt","s.augustynowicz@mojafarmacja.com","m.balin@mojafarmacja.com"],"action":["naboavida@gmail.com","isamdr@gmail.com","jpas984@gmail.com"], "kpidaily": ["naboavida@gmail.com"]}'::json
where pid = 518


update projects
set mailinglists = '{"immediate":["m.klimek@mojafarmacja.com","joao.cabral@inodev.pt"],"daily":["nuno.boavida@earthindicators.com","joao.cabral@inodev.pt","m.klimek@mojafarmacja.com","r.myrta@mojafarmacja.com","mraposo@institutogalenico.pt","s.augustynowicz@mojafarmacja.com","m.balin@mojafarmacja.com","m.balin@mojafarmacja.com"],"action":["m.klimek@mojafarmacja.com","joao.cabral@inodev.pt"], "kpidaily": ["naboavida@gmail.com"]}'::json
where pid = 419





-- migration of point attributes from project 419 to project 518

-- step 1: get all PointKey values ("1", "2", "3", "5", "6", "8", "9", "10", "12")
select attributes->>'PointKey' as PointKey
from points
where pid_proj = 419
order by (attributes->>'PointKey')::numeric;


-- step 2: apply the following sentence to each PointKey value obtained above
update points
set attributes = (
select attributes
from points
where pid_proj = 419
and attributes->>'PointKey' = '1'
)
where pid_proj = 518
and attributes->>'PointKey' = '1';



-- step 3: copy lubelska (chelm 2, point key 9) hon kpi data
update indicators
set readings = (
select readings
from indicators
where iid = 38170
)
where iid = 38300





update projects
set levelsmetadata = '[{"title": "promoter"}, {"title": "category"}, {"title": "product"}]'::json
where pid = 183


