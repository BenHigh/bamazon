var mysql = require("mysql");

var inq = require("inquirer");

var Table = require("cli-table")

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	user: "root",

	password: "",
	database: "bamazon"
});

connection.connect(function(err){
	if (err) throw err;
	console.log("connected as id: " + connection.threadId + "\n");
	listAll();
});

function listAll(){
	console.log("Listing all products...\n");
	connection.query("SELECT * FROM products", function(err, res){
		if(err) throw err;

		var prodTable = new Table({
			head: ["ID", "Product Name", "Department", "Price", "Quantity"],
			colWidths: [10, 20, 20, 10, 10]
		});

		for(i in res){
			prodTable.push([res[i].id, res[i].prod_name, res[i].dep_name, res[i].price, res[i].stock]);
		}

		console.log(String(prodTable));

		menu();
	});
}

function menu(){
	inq.prompt([
		{
			type: "input",
			name: "id",
			message: "Enter the product ID you wish to purchase: "
		},
		{
			type: "input",
			name: "quant",
			message: "Enter the quantity you wish to purchase: "
		}
	]).then(function(res){
		if(res.id && res.quant){
			purchase(res.id, res.quant);
		}
	})
}

function purchase(id, quant){
	connection.query("SELECT * FROM products WHERE id = " + id, function(err, res){
		if (err) throw err;

		if(quant <= res[0].stock){
			var total = res[0].price * quant;

			connection.query("UPDATE products SET stock = stock - " + quant + " WHERE id = " + id);

			console.log("Your total cost for " + quant + " x " + res[0].prod_name  + " is: $" + total + ".");
			console.log("Thanks for shopping with BAMAZON!");
		}else{
			console.log("Insufficient stock of " + res[0].prod_name + " to fulfill your order.");
		};
		console.log("");
		listAll();
	});
}




