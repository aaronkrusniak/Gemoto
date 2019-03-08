-- BEGIN;
-- SET client_encoding = 'LATIN1';

CREATE TABLE tweets (
       id bigint PRIMARY KEY,
       latitude REAL,
       longitude REAL,
       tweet VARCHAR(280) NOT NULL,
       name VARCHAR(15) NOT NULL,
       post_time DATE
);

CREATE TABLE emotions (
       id bigint PRIMARY KEY,
       joy REAL NOT NULL,
       anger REAL NOT NULL,
       fear REAL NOT NULL,
       sadness REAL NOT NULL
);

-- COMMIT;
-- END;
