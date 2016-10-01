alter table indicators
add column occid_occ integer;

alter table indicators
rename occid_occ to occtypeid_typ;


CREATE TABLE occurrences
(
  occid serial NOT NULL,
  pid_proj integer NOT NULL,
  object json NOT NULL,
  CONSTRAINT occurrences_pkey PRIMARY KEY (occid),
  CONSTRAINT occurrences_pid_proj_fkey FOREIGN KEY (pid_proj)
      REFERENCES projects (pid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE occurrences
  OWNER TO postgres;


