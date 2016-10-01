CREATE TABLE tasklists
(
  tlid serial NOT NULL,
  pid_proj integer NOT NULL,
  tasklist json NOT NULL,
  CONSTRAINT tasklists_pkey PRIMARY KEY (tlid),
  CONSTRAINT tasklists_pid_proj_fkey FOREIGN KEY (pid_proj)
      REFERENCES projects (pid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE tasklists
  OWNER TO postgres;