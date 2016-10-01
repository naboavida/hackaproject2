
CREATE OR REPLACE FUNCTION get_point_name(integer)
  RETURNS text AS
$$
DECLARE 
	
	temp text[];
	val text;
	vv text;
	doneread int;

	toreturn text;
	point_attributes json;
	i json;
	possible_keys text[];
	key text;
BEGIN

	-- the possible_keys is hardcoded but in the future we must select from some table
	possible_keys := array['StoreCodeAbbrv', 'Name', 'name', 'PointKey', 'Point_Key'];
	
	select attributes into point_attributes from points where pointid = $1;


	FOREACH key in array possible_keys
	loop
		RAISE NOTICE '%', key;
		if (point_attributes->key)::text is not null then
			-- when we find that one of the keys is not null on the point_attributes, return it immediately
			--raise notice 'found %', (point_attributes->key)::text;
			return (point_attributes->key)::text;
		end if;
	end loop;
	
	RETURN ($1)::text;
END;
$$
  LANGUAGE plpgsql;
  