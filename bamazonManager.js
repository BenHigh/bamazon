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
	menu();
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

function listLow(){
	console.log("Listing all products...\n");
	connection.query("SELECT * FROM products WHERE stock <= 5", function(err, res){
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

function addInv(id, quant){
	connection.query("UPDATE products SET stock = stock + " + quant + " WHERE id = " + id);

	console.log("");

	menu();
}

function addProd(prod, dep, price, quant){
	connection.query("INSERT INTO products SET ?",
    {
      prod_name: prod,
      dep_name: dep,
      price: price,
      stock: quant
    }, function(err, res) {
    	if (err) throw err;
    	console.log(res);
    	console.log(res.affectedRows + " product inserted!\n");
		console.log("");
		menu();
	});
}

function menu(){
	inq.prompt([
		{
			type: "list",
			name: "option",
			message: "Select mode: ",
			choices: ["View Inventory", "View Low Inventory", "Add Inventory", "Add New Product"]
		}
	]).then(function(res){
		console.log(res);
		if(res.option === "View Inventory"){
			listAll();
		}else if(res.option === "View Low Inventory"){
			listLow();
		}else if(res.option === "Add Inventory"){
			inq.prompt([
				{
					type: "input",
					name: "id",
					message: "Enter the product ID you wish to add inventory to: "
				},
				{
					type: "input",
					name: "quant",
					message: "Enter the quantity you wish to add: "
				}
			]).then(function(res){
				if(res.id && res.quant){
					addInv(res.id, res.quant);
				}else{
					console.log("Enter a valid ID and Quantity...");
				}
			});
		}else if(res.option === "Add New Product"){
			inq.prompt([
				{
					type: "input",
					name: "prod",
					message: "Enter the product name you wish to add to inventory: "
				},
				{
					type: "input",
					name: "dep",
					message: "Enter the department the product is in: "
				},{
					type: "input",
					name: "price",
					message: "Enter the price the product will sell at: "
				},
				{
					type: "input",
					name: "quant",
					message: "Enter the initial quantity you want to stock: "
				}
			]).then(function(res){
				if(res.prod && res.dep && res.price && res.quant){
					addProd(res.prod, res.dep, res.price, res.quant);
				}else{
					console.log("Enter valid product information...");
				}
			});
		}
	})
}


