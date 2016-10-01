alter table points
add column type character varying(50);

alter table points
add column attributes json;