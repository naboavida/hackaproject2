CREATE TABLE pollingtimers
(
  timerid serial NOT NULL,
  pid_proj integer NOT NULL,
  lastdate character varying(12),
  lasthoursecs integer,
  running boolean,
  intervalvalue integer,
  CONSTRAINT pollingtimers_pkey PRIMARY KEY (timerid),
  CONSTRAINT pollingtimers_pid_proj_fkey FOREIGN KEY (pid_proj)
      REFERENCES projects (pid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE pollingtimers
  OWNER TO postgres;