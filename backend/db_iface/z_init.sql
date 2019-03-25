-- BEGIN;
-- SET client_encoding = 'LATIN1';


CREATE TABLE IF NOT EXISTS tweets (
       id bigint PRIMARY KEY,
       loc GEOGRAPHY(POINT),
       tweet VARCHAR(280) NOT NULL,
       name VARCHAR(15) NOT NULL,
       post_time DATE
);

CREATE TABLE IF NOT EXISTS emotions (
       id bigint PRIMARY KEY,
       joy REAL NOT NULL,
       anger REAL NOT NULL,
       fear REAL NOT NULL,
       sadness REAL NOT NULL
);

-- GRANT ALL PRIVILEGES ON DATABASE "tweets" to gis_user;
-- GRANT ALL PRIVILEGES ON DATABASE "emotions" to gis_user;
-- COMMIT;
-- END;
