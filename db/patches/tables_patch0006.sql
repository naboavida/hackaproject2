alter table users
add column passwordhash character varying;


update users set passwordhash = '$2a$10$yJt9ZNDiMOe/7vO0GPJdO.ghDW0dT8dYy1lY1pKg1lSRt3RDSWyF2' where password = 'luis_pass';
update users set passwordhash = '$2a$10$v4zslcfmmue8zvonAgelSuqKz.eXIh6InZcBx92oOA/aD7zLxa93O' where password = 'p_pass';
update users set passwordhash = '$2a$10$w0R295WP25q0Ml7SDPXoCOxLzBOCTkh6fgveTp.zlIBcC9I5VjGVC' where password = 'pass_nuno';
update users set passwordhash = '$2a$10$D.3s0FR88Q84hnWwse7Inur15gb86tO9GGbdfoekNFrxeS91mmE22' where password = 'passrm';
update users set passwordhash = '$2a$10$7vcKXhQT/0tedH9gRC/5a.YPyJ1GZ8Uq2xseipLntiNwlJSMx9tf6' where password = 'pass' ;

update users set passwordhash = '$2a$10$pJOVlwy6f3Lh/lA5XOQXRe1CieJyBbTFhPEn0YeNTfsfWtxdXHMh2' where password = 'ber22lenga' ;
update users set passwordhash = '$2a$10$OLDT2Qui3VzZiYOcv0aKru7jBl9yC4TSwQthF/7lyVQFaF6mIlkMm' where password = 'pass_marta' ;

alter table users
drop column password;
