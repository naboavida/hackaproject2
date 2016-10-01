alter table pollingtimers
add column lastdailyprocessdate character varying(32);

update pollingtimers
set lastdailyprocessdate = '2015-07-08'
WHERE pid_proj = 518