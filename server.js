var express = require('express');
var https = require('https');
var fs = require('fs');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('certificado.cer')
};

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('TODO API Root');
});

// GET /todos?completada=true&q=perro
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completada') && query.completada === 'true') {
		where.completada = true;
	} else if (query.hasOwnProperty('completada') && query.completada === 'false') {
		where.completada = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		}
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	});
});

// GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).json({
				"Error": "No hay TODO con ese id"
			});
		}
	}, function(e) {
		res.status(500).send();
	});
});

// POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'completada', 'description');

	db.todo.create(body).then(function(todo) {
			req.user.addTodo(todo).then(function () {
				return todo.reload();
			}).then(function (todo) {
				res.json(todo.toJSON());
			});
		})
		.catch(function(e) {
			res.status(400).json(e);
		});
});

// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted) {
		if (rowsDeleted === 0) {
			res.status(404).json({
				"Error": "No hay tarea con ese id"
			});
		} else {
			res.status(204).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});

// PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'completada', 'description');
	var atributos = {};

	if (body.hasOwnProperty('completada')) {
		atributos.completada = body.completada;
	}

	if (body.hasOwnProperty('description')) {
		atributos.description = body.description;
	}

	db.todo.findById(todoId).then(function (todo) {
		if(todo){
			return todo.update(atributos);
		} else {
			res.status(404).send();
		}
	}, function () {
		res.status(500).send();
	}).then(function (todo) {
		res.json(todo.toJSON());
	}, function (e) {
		res.status(400).json(e);
	});

});

// POST /users
app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then(function(user) {
			res.json(user.toPublicJSON());
		})
		.catch(function(e) {
			res.status(400).json(e);
		});	
});

// POST /users/login
app.post('/users/login', function (req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function (user) {
		var token = user.generateToken('authentication');

		if(token) {
			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			res.status(401).send();
		}

	}, function () {
		res.status(401).send();
	});

});

db.sequelize.sync().then(function() {
	https.createServer(options, app).listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});