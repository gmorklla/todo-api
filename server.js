var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('TODO API Root');
});

// GET /todos?completada=true&q=perro
app.get('/todos', function(req, res) {
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
app.get('/todos/:id', function(req, res) {
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
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'completada', 'description');

	db.todo.create(body).then(function(todo) {
			res.json(todo.toJSON());
		})
		.catch(function(e) {
			res.status(400).json(e);
		});
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
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
app.put('/todos/:id', function(req, res) {
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
		}else {
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

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});