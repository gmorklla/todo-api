var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completada: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
});

sequelize.sync({
	//force: true
}).then(function() {
	console.log('Todo esta sincronizado');

	Todo.findAll({
		where: {
			completada: false
		}
	})
	.then(function (todos) {
		todos.forEach(function(todo){
			console.log(todo.toJSON());
		});
	})
	.catch(function(e) {
		console.log(e);
	})

	// Todo.create({
	// 		description: 'Comprar compu'
	// 	})
	// 	.then(function(todo) {
	// 		return Todo.create({
	// 			description: 'Limpiar cuarto'
	// 		});
	// 	})
	// 	.then(function() {
	// 		//return Todo.findById(1);
	// 		return Todo.findAll({
	// 			where: {
	// 				description: {
	// 					$like: '%compu%'
	// 				}
	// 			}
	// 		});
	// 	})
	// 	.then(function(todos) {
	// 		if (todos) {
	// 			todos.forEach(function(todo) {
	// 				console.log(todo.toJSON());
	// 			});
	// 		} else {
	// 			console.log('No todos found');
	// 		}
	// 	})
	// 	.catch(function(e) {
	// 		console.log(e);
	// 	});
});