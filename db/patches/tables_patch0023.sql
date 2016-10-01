alter table indicators
add column icon character varying(25);

update indicators set icon = 'fa fa-users' where title = 'Number of Customers' and (pid_proj = 419 or pid_proj = 518);
update indicators set icon = 'fa fa-database' where title = 'Stock Level' and (pid_proj = 419 or pid_proj = 518);
update indicators set icon = 'fa entypo-plus-circled' where title = 'Net Margin' and (pid_proj = 419 or pid_proj = 518);
update indicators set icon = 'glyphicon glyphicon-usd' where title = 'Net Sales' and (pid_proj = 419 or pid_proj = 518);
update indicators set icon = 'fa entypo-doc-text' where title = 'Multiline Bills' and (pid_proj = 419 or pid_proj = 518);
update indicators set icon = 'fa fa-shopping-cart' where title = 'Basket' and (pid_proj = 419 or pid_proj = 518);
update indicators set icon = 'fa fa-smile-o' where title = 'NPS INDEX (HoN)' and (pid_proj = 419 or pid_proj = 518);

