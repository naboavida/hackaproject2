
-- tables for demo data


-- Table: projects




DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS parameters;
DROP TABLE IF EXISTS indicators;
DROP TABLE IF EXISTS points;
DROP TABLE IF EXISTS organizations_projects;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS organizations;




CREATE TABLE organizations
(
  oid serial NOT NULL,
  name character varying(200) NOT NULL,
  code text,
  CONSTRAINT organizations_pkey PRIMARY KEY (oid)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE organizations
  OWNER TO postgres;



CREATE TABLE users
(
  uid serial NOT NULL,
  username character varying(50),
  password text,
  email character varying(100),
  oid_org integer,
  CONSTRAINT users_pkey PRIMARY KEY (uid)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE users
  OWNER TO postgres;



CREATE TABLE organizations_projects
(
  oid_org integer,
  pid_proj integer
)
WITH (
  OIDS=FALSE
);
ALTER TABLE organizations_projects
  OWNER TO postgres;





CREATE TABLE projects
(
  pid serial NOT NULL,
  title character varying(50) NOT NULL,
  area double precision,
  location character varying(50),
  x double precision,
  y double precision,
  CONSTRAINT pid PRIMARY KEY (pid)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE projects
  OWNER TO postgres;




CREATE TABLE points
(
  pointid serial NOT NULL,
  x double precision NOT NULL,
  y double precision NOT NULL,
  location character varying(50),
  picturename character varying(50),
  pid_proj integer NOT NULL,
  CONSTRAINT points_pkey PRIMARY KEY (pointid),
  CONSTRAINT points_pid_proj_fkey FOREIGN KEY (pid_proj)
      REFERENCES projects (pid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE points
  OWNER TO postgres;




CREATE TABLE indicators
(
  iid serial NOT NULL,
  title character varying(20) NOT NULL,
  unit character varying(12),
  alarm character varying(12),
  value character varying(12),
  readings json,
  pid_proj integer NOT NULL,
  pointid_point integer,
  min character varying(12),
  max character varying(12),
  CONSTRAINT indicators_pkey PRIMARY KEY (iid),
  CONSTRAINT indicators_pid_proj_fkey FOREIGN KEY (pid_proj)
      REFERENCES projects (pid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT indicators_pointid_point_fkey FOREIGN KEY (pointid_point)
      REFERENCES points (pointid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE indicators
  OWNER TO postgres;




CREATE TABLE parameters
(
  parmid serial NOT NULL,
  title character varying(20) NOT NULL,
  value character varying(12),
  unit character varying(12),
  alarm character varying(12),
  objective character varying(12),
  min character varying(12),
  max character varying(12),
  readings json,
  iid_ind integer NOT NULL,
  CONSTRAINT parameters_pkey PRIMARY KEY (parmid),
  CONSTRAINT parameters_iid_ind_fkey FOREIGN KEY (iid_ind)
      REFERENCES indicators (iid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE
)
WITH (
  OIDS=FALSE
);
ALTER TABLE parameters
  OWNER TO postgres;





CREATE TABLE activities
(
  aid serial NOT NULL,
  title character varying(50),
  description text,
  responsible character varying(30),
  start timestamp with time zone,
  "end" timestamp with time zone,
  allDay boolean,
  pid_proj integer NOT NULL,
  pointid_point integer,
  CONSTRAINT activities_pkey PRIMARY KEY (aid),
  CONSTRAINT activities_pid_proj_fkey FOREIGN KEY (pid_proj)
      REFERENCES projects (pid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT activities_pointid_point_fkey FOREIGN KEY (pointid_point)
      REFERENCES points (pointid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE activities
  OWNER TO postgres;


