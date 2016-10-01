insert into occurrences (pid_proj, object)
values (141, '{"status": "Closed", "title": "Basket is below 10 PLN", "date": "23/01/2015", "pointid":12159, "lat":"51.1197818", "lng":"23.4658107",
                    "tasks": [
                      {"done":true, "title":"Validate basket readings history", "obs": "Well... it just didnt worked as expected...!"},
                      {"done":true, "title":"Call Operator to find why the value has changed", "obs": ""},
                      {"done":true, "title":"Call Manager", "obs": ""},
                      {"done":true, "title":"Call the doctor!", "obs": ""},
                      {"done":true, "title":"Call João Cabral", "obs": ""},
                      {"done":true, "title":"Call CEO", "obs": ""}
                    ]}'::json)


insert into occurrences (pid_proj, object)
values (141, '{"status": "Ongoing", "title": "Margin below 20%", "date": "23/01/2015", "pointid":12166, "lat":"51.7480996", "lng":"19.4128204",
                    "tasks": [
                      {"done":false, "title":"Validate basket readings history", "obs": "Well... it just didnt worked as expected...!"},
                      {"done":true, "title":"Call Operator to find why the value has changed", "obs": ""}
                    ]}'::json)

insert into occurrences (pid_proj, object)
values (141, '{"status": "Open", "title": "10 sad satisfaction per hour", "date": "27/01/2015", "pointid":12163, "lat":"51.416691", "lng":"21.9641091",
                    "tasks": [
                      {"done":false, "title":"Validate customer satisfaction readings history", "obs": "Well... it just didnt worked as expected...!"},
                      {"done":false, "title":"Call Operator to find why the value has changed", "obs": ""},
                      {"done":false, "title":"Call Manager", "obs": ""}
                    ]}'::json)