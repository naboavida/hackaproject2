CREATE TABLE types
(
  tid serial NOT NULL,
  text character varying(50),
  attributes json,
  oid_org integer,
  CONSTRAINT types_pkey PRIMARY KEY (tid),
  CONSTRAINT types_oid_org_fkey FOREIGN KEY (oid_org)
      REFERENCES organizations (oid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE types
  OWNER TO postgres;

ALTER TABLE indicators ALTER title TYPE character varying(50);

ALTER TABLE parameters ALTER title TYPE character varying(50);