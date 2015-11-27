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

var User = sequelize.define('user', {
	email: Sequelize.STRING
});

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync({
	//force: true
}).then(function() {
	console.log('Todo esta sincronizado');
	// User.create({
	// 	email: 'gmorklla@gmail.com'
	// }).then(function () {
	// 	return Todo.create({
	// 		description: 'Ir al cine'
	// 	});
	// }).then(function (todo) {
	// 	User.findById(1).then(function (user) {
	// 		user.addTodo(todo);
	// 	});
	// })
	User.findById(1).then(function (user) {
		user.getTodos({
			where: {
				completada: false
			}
		}).then(function (todos) {
			todos.forEach(function (todo) {
				console.log(todo.toJSON());
			});
		});
	});
});