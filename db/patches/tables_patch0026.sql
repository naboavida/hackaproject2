CREATE TABLE reports
(
  rid serial NOT NULL,
  pid_proj integer NOT NULL,
  report json,
  CONSTRAINT reports_pkey PRIMARY KEY (rid),
  CONSTRAINT reports_pid_proj_fkey FOREIGN KEY (pid_proj)
      REFERENCES projects (pid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE reports
  OWNER TO postgres;