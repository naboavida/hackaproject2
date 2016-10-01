alter table projects
add column levelsmetadata json;



CREATE OR REPLACE FUNCTION get_meta_levels(integer)
  RETURNS text[] AS
$$
DECLARE 
	toreturn text[];
	temp text[];
	val text;
	vv text;
	doneread int;
	meta_levels text[];
BEGIN
	doneread := 0;
	select array_agg(l->>'title') into meta_levels from projects, json_array_elements(levelsmetadata) as l where pid = $1;

	IF meta_levels is not null THEN
		FOREACH vv IN ARRAY meta_levels
		LOOP
			doneread := 1;
			toreturn := toreturn || vv;
		END LOOP;
	END IF;
	

	IF doneread = 1 THEN
		RETURN toreturn;
	END IF;

	with metalevels as (select distinct json_object_keys(c) as meta_levels
	from indicators, json_array_elements(readings) as c 
	where pid_proj = $1)
	select array_agg(
		metalevels.meta_levels
	)
	into temp
	from metalevels;

	FOREACH val IN ARRAY temp
	LOOP
		if val <> 'value' and val <> 'timestamp' and val <> 'hour' then
			toreturn := toreturn || val;
		end if;
	END LOOP;

	RETURN toreturn;
END;
$$
  LANGUAGE plpgsql;

