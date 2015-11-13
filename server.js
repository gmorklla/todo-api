var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('TODO API Root');
});

// GET /todos
app.get('/todos', function (req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;

	if(queryParams.hasOwnProperty('completada') && queryParams.completada === 'true'){
		filteredTodos = _.where(filteredTodos, {completada: true});
	} else if (queryParams.hasOwnProperty('completada') && queryParams.completada === 'false') {
		filteredTodos = _.where(filteredTodos, {completada: false});
	}

	res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if(matchedTodo){
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}

});

// POST /todos
app.post('/todos', function (req, res) {
	var body = _.pick(req.body, 'completada', 'description');

	if( !_.isBoolean(body.completada) || !_.isString(body.description) || body.description.trim().length === 0 ){
		return res.status(400).send();
	}

	body.description = body.description.trim();
	body.id = todoNextId;

	todos.push(body);
	
	res.json(body);

	todoNextId++;
});

// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if(matchedTodo){
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	} else {
		res.status(404).json({"Error": "No hay tarea con ese id"});
	}	
});

// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});	
	var body = _.pick(req.body, 'completada', 'description');
	var atributosValidos = {};

	if(!matchedTodo) {
		return res.status(404).send();
	}

	if(body.hasOwnProperty('completada') && _.isBoolean(body.completada)) {
		atributosValidos.completada = body.completada;
	} else if(body.hasOwnProperty('completada')){
		return res.status(400).send();
	}

	if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		atributosValidos.description = body.description;
	} else if(body.hasOwnProperty('description')){
		return res.status(400).send();
	}

	_.extend(matchedTodo, atributosValidos);
	res.json(matchedTodo);

});

app.listen(PORT, function () {
	console.log('Express listening on port ' + PORT + '!');
});