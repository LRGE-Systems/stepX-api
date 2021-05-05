## Detailing of User routes

- To obtain the data of the current user, make an http (GET) request for the route: /users/me
- To register a new user, make an http (POST) request for the route: /users
- To request the password recovery link: /users/requestPassword
- To reset a password, make an http (PATCH) request for the route: /users/recoverPassword

Body to request the recovery link:

        { "email": "email@email.com"	 }




Body to change the password:

        { "senha": "senha123" }