alter table projects
add column mailinglists json;

UPDATE projects SET mailinglists = '[{"immediate":[], "daily":[], "action":[] }]'::json
WHERE pid = XXXXX; /* only for Moja Farmacja Projects - modify accordingly */