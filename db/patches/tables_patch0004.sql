CREATE TABLE widgets
(
  wid serial NOT NULL,
  title character varying(50) NOT NULL,
  datasource text,
  summarymethod text,
  pid_proj integer,
  CONSTRAINT widgets_pkey PRIMARY KEY (wid),
  CONSTRAINT widgets_pid_proj_fkey FOREIGN KEY (pid_proj)
      REFERENCES projects (pid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE widgets
  OWNER TO postgres;