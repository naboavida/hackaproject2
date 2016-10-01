
alter table organizations
add column image_org text;

alter table projects
add column image text;


update organizations
set image_org = 'generalmills-bw.jpg'
where name = 'GeneralMills';


update organizations
set image_org = 'logo_ubismart.png'
where name = 'earthindicators';

update organizations
set image_org = 'moja2.png'
where name = 'MojaFarmacja';


