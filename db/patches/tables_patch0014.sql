CREATE TABLE occurrenceconfigs
(
  occcfgid serial NOT NULL,
  pid_proj integer NOT NULL,
  config json NOT NULL,
  CONSTRAINT occurrenceconfigs_pkey PRIMARY KEY (occcfgid),
  CONSTRAINT occurrenceconfigs_pid_proj_fkey FOREIGN KEY (pid_proj)
      REFERENCES projects (pid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE occurrenceconfigs
  OWNER TO postgres;
