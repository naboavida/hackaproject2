
CREATE OR REPLACE FUNCTION get_meta_levels(integer)
  RETURNS text[] AS
$$
DECLARE 
	toreturn text[];
	temp text[];
	val text;
BEGIN
	

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
		--RAISE NOTICE '[%]', val;
		if val <> 'value' and val <> 'timestamp' and val <> 'hour' then
			toreturn := toreturn || val;
		end if;
	END LOOP;

	RETURN toreturn;
END;
$$
  LANGUAGE plpgsql;