CREATE TABLE datatypes
(
  dtid serial NOT NULL,
  title character varying(50) NOT NULL,
  unit character varying(12),
  alarm character varying(12),
  min character varying(12),
  max character varying(12),
  pid_proj integer NOT NULL,
  CONSTRAINT datatypes_pkey PRIMARY KEY (dtid)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE datatypes
  OWNER TO postgres;